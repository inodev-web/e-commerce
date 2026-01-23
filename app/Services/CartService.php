<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\AddToCartDTO;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
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
        
        // Vérifier disponibilité
        if (!$product->isAvailable()) {
            throw new \Exception("Ce produit n'est pas disponible");
        }
        
        // Vérifier stock
        $existingItem = $cart->items()->where('product_id', $dto->productId)->first();
        $totalQuantity = $dto->quantity + ($existingItem?->quantity ?? 0);
        
        if ($totalQuantity > $product->stock) {
            throw new \Exception("Stock insuffisant. Disponible: {$product->stock}");
        }
        
        // Si l'item existe déjà, mettre à jour la quantité
        if ($existingItem) {
            $existingItem->update([
                'quantity' => $totalQuantity,
                'price_snapshot' => $product->price, // Mettre à jour le prix snapshot
            ]);
            
            return $existingItem;
        }
        
        // Sinon, créer un nouvel item avec price snapshot
        return CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $dto->productId,
            'quantity' => $dto->quantity,
            'price_snapshot' => $product->price, // SNAPSHOT du prix actuel
        ]);
    }

    /**
     * Mettre à jour la quantité d'un item
     */
    public function updateQuantity(CartItem $item, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            throw new \Exception("La quantité doit être positive");
        }
        
        // Vérifier le stock
        if ($quantity > $item->product->stock) {
            throw new \Exception("Stock insuffisant. Disponible: {$item->product->stock}");
        }
        
        $item->update(['quantity' => $quantity]);
        
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
            $existingItem = $clientCart->items()->where('product_id', $item->product_id)->first();
            
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
                'product.specificationValues.specification'
            ])
            ->get();
    }
}
