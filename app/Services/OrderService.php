<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\CreateOrderDTO;
use App\Enums\OrderStatus;
use App\Models\Cart;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\PromoCode;
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
                ->firstOrFail();
            
            // 3. Calculer le total des produits à partir de la base de données
            $productsTotal = 0;
            $validatedItems = [];
            
            foreach ($dto->items as $productId => $item) {
                $product = Product::findOrFail($productId);
                
                // Vérifier disponibilité
                if (!$product->isAvailable()) {
                    throw new \Exception("Le produit {$product->name} n'est pas disponible");
                }
                
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stock insuffisant pour {$product->name}");
                }
                
                $subtotal = $product->price * $item['quantity'];
                $productsTotal += $subtotal;
                
                $validatedItems[$productId] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ];
            }
            
            // 4. Appliquer promo code si présent
            $discountTotal = 0;
            if ($dto->promoCode) {
                $promo = PromoCode::where('code', $dto->promoCode)
                    ->where('is_active', true)
                    ->first();
                    
                if ($promo && $promo->isValid($dto->clientId)) {
                    $discountTotal = $promo->calculateDiscount($productsTotal);
                }
            }
            
            // 4.5. Appliquer points de fidélité si demandé
            $loyaltyDiscount = 0;
            if ($dto->loyaltyPointsUsed > 0 && $dto->clientId) {
                try {
                    $loyaltyDiscount = $this->loyaltyService->convertToDiscount(
                        $dto->clientId,
                        $dto->loyaltyPointsUsed
                    );
                } catch (\Exception $e) {
                    throw new \Exception("Erreur points fidélité: " . $e->getMessage());
                }
            }
            
            // 5. Calculer le total final
            $totalPrice = $productsTotal - $discountTotal - $loyaltyDiscount + $deliveryTariff->price;
            
            // 6. Créer la commande avec SNAPSHOTS
            $order = Order::create([
                'client_id' => $dto->clientId,
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
            
            // 7. Créer les order items avec METADATA SNAPSHOT (JSONB)
            foreach ($validatedItems as $productId => $item) {
                $product = $item['product'];
                $product->load('specificationValues.specification');
                
                // Construire le metadata snapshot JSONB
                $metadataSnapshot = [
                    'name' => $product->name,
                    'description' => $product->description,
                    'specifications' => $product->specificationValues->map(fn($sv) => [
                        'name' => $sv->specification->name,
                        'value' => $sv->value,
                        'required' => $sv->specification->required,
                    ])->toArray(),
                ];
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'quantity' => $item['quantity'],
                    'price_snapshot' => $item['price'],
                    'metadata_snapshot' => $metadataSnapshot,  // JSONB SNAPSHOT
                ]);
                
                // 8. Décrémenter le stock
                $product->decrementStock($item['quantity']);
            }
            
            // 9. Ajouter des points de fidélité si client connecté
            if ($dto->clientId) {
                $this->loyaltyService->awardPoints($dto->clientId, $totalPrice);
            }

            // 10. Pixel Tracking
            $this->pixelService->trackPurchase($order);
            
            // 10. Vider le panier si présent
            if ($dto->clientId) {
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
