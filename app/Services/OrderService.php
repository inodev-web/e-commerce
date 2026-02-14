<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\CreateOrderDTO;
use App\Enums\OrderStatus;
use App\Models\Cart;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\LoyaltySetting;
use App\Models\User;
use App\Models\Wilaya;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly LoyaltyService $loyaltyService,
        private readonly PixelService $pixelService,
    ) {}

    /**
     * 🛡️ VALIDATION: Anti-Cumul + Anti-Fraud
     * Validates promo/referral code with strict security rules
     * 
     * @return array{type: string|null, promo: PromoCode|null, referrer: User|null, discount: float, free_shipping: bool, referrer_client_id: int|null, referral_code: string|null}
     */
    private function validatePromoAndReferral(
        ?string $promoCode,
        ?int $clientId,
        ?string $clientIp,
        string $clientPhone
    ): array {
        if (!$promoCode) {
            return [
                'type' => null,
                'promo' => null,
                'referrer' => null,
                'discount' => 0,
                'free_shipping' => false,
                'referrer_client_id' => null,
                'referral_code' => null,
            ];
        }

        $code = strtoupper(trim($promoCode));

        // ATTEMPT 1: Check if it's an admin promo code
        $promo = PromoCode::where('code', $code)
            ->where('is_active', true)
            ->first();

        if ($promo && $promo->isValid($clientId)) {
            return [
                'type' => 'promo',
                'promo' => $promo,
                'referrer' => null,
                'discount' => 0, // calculated later
                'free_shipping' => false,
                'referrer_client_id' => null,
                'referral_code' => null,
            ];
        }

        // ATTEMPT 2: Check if it's a referral code
        $referrer = User::where('referral_code', $code)->first();

        if (!$referrer || !$referrer->client) {
            throw new \Exception("Code invalide: {$code}");
        }

        // 🛡️ ANTI-FRAUD CHECK 1: Self-referral
        if ($clientId && $referrer->client->id === $clientId) {
            throw new \Exception("Vous ne pouvez pas utiliser votre propre code de parrainage");
        }

        // 🛡️ ANTI-FRAUD CHECK 2: First order only (ne compte que les commandes livrées)
        if ($clientId) {
            $previousDeliveredOrders = Order::where('client_id', $clientId)
                ->where('status', OrderStatus::DELIVERED)
                ->count();
            if ($previousDeliveredOrders > 0) {
                throw new \Exception("Le code de parrainage n'est valide que pour votre première commande");
            }
        }

        // 🛡️ ANTI-FRAUD CHECK 3: IP address duplication (if IP provided)
        if ($clientIp) {
            $referrerLastOrder = Order::where('client_id', $referrer->client->id)
                ->whereNotNull('client_ip')
                ->latest()
                ->first();
            
            if ($referrerLastOrder && $referrerLastOrder->client_ip === $clientIp) {
                \Log::warning('Referral fraud attempt: IP duplication', [
                    'referrer_client_id' => $referrer->client->id,
                    'client_ip' => $clientIp,
                ]);
                throw new \Exception("Code de parrainage non valide");
            }
        }

        // 🛡️ ANTI-FRAUD CHECK 4: Phone duplication
        if ($referrer->phone === $clientPhone) {
            \Log::warning('Referral fraud attempt: Phone duplication', [
                'referrer_phone' => $referrer->phone,
                'client_phone' => $clientPhone,
            ]);
            throw new \Exception("Code de parrainage non valide");
        }

        $settings = LoyaltySetting::first();

        \Log::info('OrderService - Referral code validated', [
            'code' => $code,
            'referrer_user_id' => $referrer->id,
            'referrer_client_id' => $referrer->client->id,
            'clientId' => $clientId,
            'is_guest' => $clientId === null,
        ]);
        
        return [
            'type' => 'referral',
            'promo' => null,
            'referrer' => $referrer,
            'discount' => 0, // calculated from settings later
            'free_shipping' => false,
            'referrer_client_id' => $referrer->client->id,
            'referral_code' => $code,
        ];
    }


    /**
     * Créer une commande avec transaction DB et snapshots critiques
     */
    public function create(CreateOrderDTO $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            // 1. Récupérer Wilaya et Commune pour snapshots
            $wilaya = Wilaya::findOrFail($dto->wilayaId);
            $commune = Commune::findOrFail($dto->communeId);
            
            // 2. CRITIQUE: Récupérer le tarif de livraison EN VIGUEUR au moment de la transaction
            $deliveryTariff = DeliveryTariff::where('wilaya_id', $dto->wilayaId)
                ->where('type', $dto->deliveryType)
                ->where('is_active', true)
                ->first();

            if (!$deliveryTariff) {
                throw new \Exception("La livraison n'est pas encore configurée pour cette Wilaya (" . $wilaya->name . ") et ce mode (" . $dto->deliveryType->value . "). Contactez l'administrateur.");
            }
            
            // 3. Calculer le total des produits (⚡️ FIX N+1 : Fetch all at once)
            $productIds = array_keys($dto->items);
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');
            
            \Log::info('OrderService - Processing items', [
                'product_ids' => $productIds,
                'items' => $dto->items,
                'products_count' => $products->count(),
            ]);
            
            $productsTotal = 0;
            $validatedItems = [];
            
            foreach ($dto->items as $productId => $item) {
                $product = $products->get($productId);
                
                if (!$product) {
                    throw new \Exception("Produit non trouvé : {$productId}");
                }
                
                // Vérifier disponibilité
                if (!$product->isAvailable()) {
                    $productName = is_array($product->name) 
                        ? ($product->getTranslation('name', app()->getLocale()) ?? $product->getTranslation('name', 'fr') ?? 'Produit')
                        : $product->name;
                    throw new \Exception("Le produit {$productName} n'est pas disponible");
                }
                
                // Determine available stock: use total_stock if variants exist, otherwise use direct stock
                $availableStock = $product->hasVariants() ? $product->total_stock : $product->stock;
                
                if ($availableStock < $item['quantity']) {
                    $productName = is_array($product->name) 
                        ? ($product->getTranslation('name', app()->getLocale()) ?? $product->getTranslation('name', 'fr') ?? 'Produit')
                        : $product->name;
                    throw new \Exception("Stock insuffisant pour {$productName}. Disponible: {$availableStock}");
                }
                
                $subtotal = $product->price * $item['quantity'];
                $productsTotal += $subtotal;
                
                $validatedItems[$productId] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                    'specification_values' => $item['specification_values'] ?? [],
                ];
            }
            
            \Log::info('OrderService - Validated items count', ['count' => count($validatedItems)]);
            
            
            // 4. 🛡️ VALIDATE & APPLY promo code (admin) OR referral code
            $validation = $this->validatePromoAndReferral(
                $dto->promoCode,
                $dto->clientId,
                $dto->clientIp,
                $dto->phone
            );

            $discountTotal = 0;
            $freeShipping = false;
            $referrerId = null;
            $referrerClientId = $validation['referrer_client_id'];
            $referralCode = $validation['referral_code'];
            $settings = null;

            if ($validation['type'] === 'promo') {
                $promoResult = $validation['promo']->calculateDiscount((float) $productsTotal, (float) $deliveryTariff->price);
                $discountTotal = min($promoResult['discount'], $productsTotal);
                $freeShipping = $promoResult['free_shipping'];
                
                \Log::info('OrderService - Promo code applied', [
                    'code' => $dto->promoCode,
                    'discount' => $discountTotal,
                    'free_shipping' => $freeShipping,
                ]);
            } elseif ($validation['type'] === 'referral') {
                $settings = LoyaltySetting::first();
                $discountAmount = $settings?->referral_discount_amount ?? 0;
                
                if ($discountAmount > 0) {
                    $discountTotal = min((float) $discountAmount, $productsTotal);
                    $referrerId = $validation['referrer']->id;
                    
                    \Log::info('OrderService - Referral code applied', [
                        'code' => $dto->promoCode,
                        'discount' => $discountTotal,
                        'referrer_id' => $referrerId,
                    ]);
                }
            }

            // 4.5. Appliquer points de fidélité si demandé
            $loyaltyDiscount = 0;
            \Log::info('OrderService - Loyalty check', [
                'loyaltyPointsUsed' => $dto->loyaltyPointsUsed,
                'clientId' => $dto->clientId,
                'productsTotal' => $productsTotal,
                'deliveryPrice' => $deliveryTariff->price,
                'discountTotal' => $discountTotal,
            ]);
            
            if ($dto->loyaltyPointsUsed > 0 && $dto->clientId) {
                try {
                    // Calculer le montant maximum déductible (Total produits + Livraison - Autres remises)
                    // On veut éviter un total négatif
                    $currentTotal = $productsTotal + $deliveryTariff->price - $discountTotal;
                    
                    \Log::info('OrderService - Converting points', [
                        'clientId' => $dto->clientId,
                        'pointsToConvert' => $dto->loyaltyPointsUsed,
                        'currentTotal' => $currentTotal,
                    ]);
                    
                    if ($currentTotal > 0) {
                        $loyaltyDiscount = $this->loyaltyService->convertToDiscount(
                            $dto->clientId,
                            $dto->loyaltyPointsUsed,
                            (float) $currentTotal 
                        );
                        
                        \Log::info('OrderService - Points converted', [
                            'loyaltyDiscount' => $loyaltyDiscount,
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('OrderService - Points conversion error', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    throw new \Exception("Erreur points fidélité: " . $e->getMessage());
                }
            }
            
            // 5. Calculer le total final avec support FREE_SHIPPING
            $finalDeliveryPrice = $freeShipping ? 0 : $deliveryTariff->price;
            $totalPrice = $productsTotal - $discountTotal - $loyaltyDiscount + $finalDeliveryPrice;
            
            // 🛡️ SAFE CALCULATION: Ensure total is never negative
            if ($totalPrice < 0) {
                \Log::warning('OrderService - Total price capped at 0', [
                    'calculated_total' => $totalPrice,
                    'products_total' => $productsTotal,
                    'discount_total' => $discountTotal,
                    'loyalty_discount' => $loyaltyDiscount,
                    'delivery_price' => $finalDeliveryPrice,
                ]);
                $totalPrice = 0;
            }
            
            // 6. Créer la commande avec SNAPSHOTS
            $order = Order::create([
                'client_id' => $dto->clientId,
                'referrer_id' => $referrerId,
                'referral_code' => $referralCode,
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'phone' => $dto->phone,
                'client_ip' => $dto->clientIp,
                'address' => $dto->address ?? '',
                'wilaya_name' => $wilaya->name,              // SNAPSHOT STRING
                'commune_name' => $commune->name,             // SNAPSHOT STRING
                'delivery_type' => $dto->deliveryType,
                'delivery_price' => $finalDeliveryPrice,      // SNAPSHOT PRICE (0 if FREE_SHIPPING)
                'products_total' => $productsTotal,
                'discount_total' => $discountTotal + $loyaltyDiscount,
                'total_price' => $totalPrice,
                'promo_code' => $validation['type'] === 'promo' ? $dto->promoCode : null,
                'is_free_shipping' => $freeShipping,
                'status' => OrderStatus::PENDING,
            ]);
            
            // 7. Créer les order items avec MINIMAL SNAPSHOT
            \Log::info('OrderService - Creating order items', ['order_id' => $order->id, 'validated_items_count' => count($validatedItems)]);
            
            foreach ($validatedItems as $productId => $item) {
                $product = $item['product'];
                $selectedSpecValues = $item['specification_values'] ?? [];
                
                \Log::info('OrderService - Creating item', [
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'spec_values' => $selectedSpecValues,
                ]);
                
                // Get specification names and decrement quantities
                $specificationDetails = [];
                if (!empty($selectedSpecValues)) {
                    $specificationIds = array_keys($selectedSpecValues);
                    $specifications = \App\Models\Specification::whereIn('id', $specificationIds)
                        ->get()
                        ->keyBy('id');
                    
                    foreach ($selectedSpecValues as $specId => $value) {
                        if (isset($specifications[$specId])) {
                            $specificationDetails[] = [
                                'n' => $specifications[$specId]->name,
                                'v' => $value,
                            ];

                        }
                    }
                }
                
                // ⚡️ OPTIMISATION : Snapshot ultra-léger (pas de descriptions fleuves)
                $metadataSnapshot = [
                    'name' => $product->name,
                    'specifications' => $specificationDetails,
                ];
                
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'quantity' => $item['quantity'],
                    'price_snapshot' => $item['price'],
                    'metadata_snapshot' => $metadataSnapshot,
                ]);
                
                \Log::info('OrderService - Item created', ['order_item_id' => $orderItem->id]);
                
                // 8. Stock is NOT decremented here — it will be decremented when order is DELIVERED
                // (see updateStatus() -> DELIVERED)
            }
            
            // 9. Points de fidélité et parrainage sont attribués uniquement à la livraison
            // (voir updateStatus() -> DELIVERED)

            // 10. Pixel Tracking
            $this->pixelService->trackPurchase($order);
            
            // 10. Vider le panier si nécessaire
            if ($dto->clientId && $dto->clearCart) {
                Cart::where('client_id', $dto->clientId)->delete();
            }
            
            return $order->fresh(['items']);
        });
    }

    /**
     * Met à jour le statut d'une commande
     */
    public function updateStatus(Order $order, OrderStatus $newStatus): Order
    {
        // Vérifier la transition valide
        if (!$order->status->canTransitionTo($newStatus)) {
            throw new \Exception("Transition invalide de {$order->status->value} vers {$newStatus->value}");
        }

        return DB::transaction(function () use ($order, $newStatus) {
            $oldStatus = $order->status;
            
            // Stock is only decremented on DELIVERED, so no re-decrement needed when
            // transitioning from CANCELLED back to another status.

            $order->update(['status' => $newStatus]);

            // Décrémenter le stock et attribuer les points uniquement quand la commande est livrée
            if ($newStatus === OrderStatus::DELIVERED) {
                // 🔻 Decrement stock & specification quantities on delivery
                try {
                    $order->load('items.product');
                    foreach ($order->items as $item) {
                        if ($item->product) {
                            // Decrement main product stock
                            $item->product->decrement('stock', $item->quantity);
                            $item->product->decrementStock($item->quantity);

                            // Decrement specification value quantities from snapshot
                            $specs = $item->metadata_snapshot['specifications'] ?? [];
                            foreach ($specs as $spec) {
                                try {
                                    $specValue = \App\Models\ProductSpecificationValue::where('product_id', $item->product_id)
                                        ->whereHas('specification', fn($q) => $q->where('name->en', $spec['n']))
                                        ->where('value', $spec['v'])
                                        ->first();

                                    if ($specValue) {
                                        $specValue->decrement('quantity', $item->quantity);
                                    } else {
                                        \Log::warning('OrderService - DELIVERED: SpecValue not found for decrement', [
                                            'product_id' => $item->product_id,
                                            'spec_name' => $spec['n'],
                                            'value' => $spec['v'],
                                        ]);
                                    }
                                } catch (\Exception $e) {
                                    \Log::error('OrderService - DELIVERED: Failed to decrement spec value', [
                                        'error' => $e->getMessage(),
                                        'product_id' => $item->product_id,
                                        'spec_name' => $spec['n'],
                                        'value' => $spec['v'],
                                    ]);
                                }
                            }

                            \Log::info('OrderService - DELIVERED: Stock decremented', [
                                'order_id' => $order->id,
                                'product_id' => $item->product_id,
                                'quantity' => $item->quantity,
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('OrderService - DELIVERED: Stock decrement error (non-fatal)', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                    ]);
                    // Don't throw — the status update itself should still succeed
                }
                try {
                    // Points de parrainage pour le parrain
                    if ($order->referrer_id && $order->referral_code) {
                        \Log::info('OrderService - DELIVERED: Processing referral points', [
                            'order_id' => $order->id,
                            'referrer_id' => $order->referrer_id,
                            'referral_code' => $order->referral_code,
                        ]);

                        $settings = LoyaltySetting::first();
                        if ($settings && $settings->referral_reward_points > 0) {
                            // Charger la relation referrer avec client
                            $order->load('referrer.client');
                            $referrerClientId = $order->referrer?->client?->id;

                            if ($referrerClientId) {
                                // Vérifier qu'on n'a pas déjà attribué les points pour cette commande
                                $pointDescription = "Parrainage: commande #{$order->id} (code {$order->referral_code})";
                                $alreadyAwarded = LoyaltyPoint::where('client_id', $referrerClientId)
                                    ->where('description', $pointDescription)
                                    ->exists();

                                if (!$alreadyAwarded) {
                                    LoyaltyPoint::create([
                                        'client_id' => $referrerClientId,
                                        'points' => (int) $settings->referral_reward_points,
                                        'description' => $pointDescription,
                                    ]);
                                    \Log::info('OrderService - Referral points awarded', [
                                        'order_id' => $order->id,
                                        'referrer_client_id' => $referrerClientId,
                                        'points' => $settings->referral_reward_points,
                                    ]);
                                } else {
                                    \Log::info('OrderService - Referral points already awarded, skipping', [
                                        'order_id' => $order->id,
                                    ]);
                                }
                            } else {
                                \Log::warning('OrderService - Referrer has no client record', [
                                    'order_id' => $order->id,
                                    'referrer_id' => $order->referrer_id,
                                ]);
                            }
                        }
                    }

                    // Points de fidélité pour le client
                    if ($order->client_id) {
                        $this->loyaltyService->awardPoints($order->client_id, (float) $order->total_price);
                        \Log::info('OrderService - Loyalty points awarded on delivery', [
                            'order_id' => $order->id,
                            'client_id' => $order->client_id,
                            'total_price' => $order->total_price,
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('OrderService - Error awarding points on delivery', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    // Don't throw — the status update itself should still succeed
                }
            }

            return $order;
        });
    }

    /**
     * Annuler une commande et restaurer le stock
     */
    public function cancel(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            // Vérifier que la commande peut être annulée
            if (!$order->status->canTransitionTo(OrderStatus::CANCELLED)) {
                throw new \Exception("Cette commande ne peut pas être annulée");
            }
            
            // Stock is only decremented on DELIVERED, and DELIVERED -> CANCELLED is not allowed,
            // so there is no stock to restore here.
            
            // Marquer comme annulée
            $order->update(['status' => OrderStatus::CANCELLED]);
            
            return $order;
        });
    }
}




