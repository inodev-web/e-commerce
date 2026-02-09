<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\AddToCartDTO;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Collection;

class CartService
{
    /**
     * Récupérer ou créer un panier (hybride: session pour visiteurs, DB pour clients)
     */
    public function getOrCreate(?int $clientId, string $sessionId): Cart
    {
        if ($clientId) {
            // Client connecté: chercher par client_id
            return Cart::firstOrCreate(
                ['client_id' => $clientId],
                ['session_id' => null]
            );
        }
        
        // Visiteur: chercher par session_id
        return Cart::firstOrCreate(
            ['session_id' => $sessionId],
            ['client_id' => null]
        );
    }

    /**
     * Ajouter un produit au panier
     */
    public function addItem(AddToCartDTO $dto): CartItem
    {
        $cart = $this->getOrCreate($dto->clientId, $dto->sessionId);
        $product = Product::findOrFail($dto->productId);
        
        // Si une variante est fournie, récupérer la variante
        $variant = null;
        if ($dto->productVariantId) {
            $variant = ProductVariant::where('product_id', $dto->productId)
                ->where('id', $dto->productVariantId)
                ->where('is_active', true)
                ->firstOrFail();
        }
        
        // Vérifier disponibilité du produit
        if (!$product->isAvailable()) {
            throw new \Exception("Ce produit n'est pas disponible");
        }
        
        // Vérifier disponibilité de la variante si fournie
        if ($variant && !$variant->is_active) {
            throw new \Exception("Cette variante n'est pas disponible");
        }
        
        // Déterminer le prix et le stock à utiliser
        $price = $variant ? $variant->price : $product->price;
        $stock = $variant ? $variant->stock : $product->stock;
        
        // Vérifier stock
        $existingItemQuery = $cart->items()->where('product_id', $dto->productId);
        if ($dto->productVariantId) {
            $existingItemQuery->where('product_variant_id', $dto->productVariantId);
        } else {
            $existingItemQuery->whereNull('product_variant_id');
        }
        $existingItem = $existingItemQuery->first();
        
        $totalQuantity = $dto->quantity + ($existingItem?->quantity ?? 0);
        
        if ($totalQuantity > $stock) {
            throw new \Exception("Stock insuffisant. Disponible: {$stock}");
        }
        
        // Si l'item existe déjà, mettre à jour la quantité
        if ($existingItem) {
            $existingItem->update([
                'quantity' => $totalQuantity,
                'price_snapshot' => $price,
            ]);
            
            return $existingItem;
        }
        
        // Sinon, créer un nouvel item avec price snapshot
        return CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $dto->productId,
            'product_variant_id' => $dto->productVariantId,
            'quantity' => $dto->quantity,
            'price_snapshot' => $price,
            'specification_values' => $dto->specificationValues,
        ]);
    }

    /**
     * Mettre à jour la quantité d'un item
     */
    public function updateQuantity(CartItem $item, int $quantity, ?array $specificationValues = null): CartItem
    {
        if ($quantity <= 0) {
            throw new \Exception("La quantité doit être positive");
        }
        
        // Vérifier le stock
        $stock = $item->productVariant ? $item->productVariant->stock : $item->product->stock;
        if ($quantity > $stock) {
            throw new \Exception("Stock insuffisant. Disponible: {$stock}");
        }
        
        $updateData = ['quantity' => $quantity];
        if ($specificationValues !== null) {
            $updateData['specification_values'] = $specificationValues;
        }
        
        $item->update($updateData);
        
        return $item;
    }

    /**
     * Supprimer un item du panier
     */
    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    /**
     * Vider le panier
     */
    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }

    /**
     * Migrer le panier d'un visiteur vers un client connecté
     */
    public function migrateGuestCart(string $sessionId, int $clientId): void
    {
        $guestCart = Cart::where('session_id', $sessionId)->first();
        
        if (!$guestCart) {
            return;
        }
        
        $clientCart = $this->getOrCreate($clientId, '');
        
        // Fusionner les items
        foreach ($guestCart->items as $item) {
            $existingItemQuery = $clientCart->items()->where('product_id', $item->product_id);
            if ($item->product_variant_id) {
                $existingItemQuery->where('product_variant_id', $item->product_variant_id);
            } else {
                $existingItemQuery->whereNull('product_variant_id');
            }
            $existingItem = $existingItemQuery->first();
            
            if ($existingItem) {
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $item->quantity,
                ]);
            } else {
                $item->update(['cart_id' => $clientCart->id]);
            }
        }
        
        // Supprimer le panier visiteur
        $guestCart->delete();
    }

    /**
     * Obtenir le total du panier
     */
    public function getTotal(Cart $cart): float
    {
        return $cart->calculateTotal();
    }

    /**
     * Obtenir les items avec produits chargés
     */
    public function getItemsWithProducts(Cart $cart): Collection
    {
        return $cart->items()
            ->with([
                'product.images',
                'product.subCategory.category',
                'product.specificationValues.specification',
                'productVariant',
                'productVariant.variantSpecifications',
            ])
            ->get();
    }
}
