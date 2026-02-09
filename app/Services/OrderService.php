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
            
            // 4. Appliquer code promo (admin) ou parrainage si présent
            $discountTotal = 0;
            $referrerId = null;
            $referrerClientId = null;
            $referralCode = null;
            $settings = null;

            if ($dto->promoCode) {
                $code = strtoupper(trim($dto->promoCode));

                $promo = PromoCode::where('code', $code)
                    ->where('is_active', true)
                    ->first();

                if ($promo && $promo->isValid($dto->clientId)) {
                    $discountTotal = min($promo->calculateDiscount($productsTotal), $productsTotal);
                } else {
                    $referrer = User::where('referral_code', $code)->first();

                    if ($referrer && $referrer->client) {
                        $referrerClientId = $referrer->client->id;
                        if (!$dto->clientId || $referrerClientId !== $dto->clientId) {
                            $settings = LoyaltySetting::first();
                            $discountAmount = $settings?->referral_discount_amount ?? 0;
                            if ($discountAmount > 0) {
                                $discountTotal = min((float) $discountAmount, $productsTotal);
                                $referrerId = $referrer->id;
                                $referralCode = $code;
                            }
                        }
                    }
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
            
            // 5. Calculer le total final
            $totalPrice = $productsTotal - $discountTotal - $loyaltyDiscount + $deliveryTariff->price;
            
            // 6. Créer la commande avec SNAPSHOTS
            $order = Order::create([
                'client_id' => $dto->clientId,
                'referrer_id' => $referrerId,
                'referral_code' => $referralCode,
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'phone' => $dto->phone,
                'address' => $dto->address,
                'wilaya_name' => $wilaya->name,              // SNAPSHOT STRING
                'commune_name' => $commune->name,             // SNAPSHOT STRING
                'delivery_type' => $dto->deliveryType,
                'delivery_price' => $deliveryTariff->price,   // SNAPSHOT PRICE
                'products_total' => $productsTotal,
                'discount_total' => $discountTotal + $loyaltyDiscount,
                'total_price' => $totalPrice,
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

                            // Decrement specification value quantity
                            try {
                                $specValue = \App\Models\ProductSpecificationValue::where('product_id', $productId)
                                    ->where('specification_id', $specId)
                                    ->where('value', $value)
                                    ->first();

                                if ($specValue) {
                                    $specValue->decrement('quantity', $item['quantity']);
                                } else {
                                     \Log::warning("OrderService - ProductSpecificationValue not found for decrement", [
                                        'product_id' => $productId,
                                        'spec_id' => $specId,
                                        'value' => $value
                                    ]);
                                }
                            } catch (\Exception $e) {
                                \Log::error("OrderService - Failed to decrement specification value", [
                                    'error' => $e->getMessage(),
                                    'product_id' => $productId,
                                    'spec_id' => $specId,
                                    'value' => $value
                                ]);
                            }
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
                
                // 8. Décrémenter le stock
                $product->decrement('stock', $item['quantity']);
                $product->decrementStock($item['quantity']);
            }
            
            // 9. Ajouter des points de parrainage si code utilisé
            if ($referrerClientId && $settings && $settings->referral_reward_points > 0) {
                LoyaltyPoint::create([
                    'client_id' => $referrerClientId,
                    'points' => (int) $settings->referral_reward_points,
                    'description' => 'Parrainage: code ' . $referralCode,
                ]);
            }
            // 9. Ajouter des points de fidélité si client connecté
            if ($dto->clientId) {
                $this->loyaltyService->awardPoints($dto->clientId, $totalPrice);
            }

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
        
        $order->update(['status' => $newStatus]);
        
        return $order;
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
            
            // Restaurer le stock
            foreach ($order->items as $item) {
                $item->product->incrementStock($item->quantity);
            }
            
            // Marquer comme annulée
            $order->update(['status' => OrderStatus::CANCELLED]);
            
            return $order;
        });
    }
}




