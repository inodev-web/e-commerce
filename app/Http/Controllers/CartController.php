<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DTOs\AddToCartDTO;
use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
    ) {}

    /**
     * Afficher le panier
     */
    public function show(): Response
    {
        $cart = $this->cartService->getOrCreate(
            auth()->user()?->client?->id,
            session()->getId()
        );
        
        $items = $this->cartService->getItemsWithProducts($cart);
        $total = $this->cartService->getTotal($cart);
        
        return Inertia::render('Cart/Show', [
            'cart' => $cart,
            'items' => $items,
            'total' => $total,
            'itemCount' => $cart->getTotalItems(),
        ]);
    }

    /**
     * Ajouter un produit au panier
     */
    public function addItem(AddToCartRequest $request): RedirectResponse
    {
        try {
            $dto = AddToCartDTO::fromRequest(
                $request->validated(),
                auth()->user()?->client?->id,
                session()->getId()
            );
            
            $this->cartService->addItem($dto);
            
            return redirect()->back()->with('success', 'Produit ajouté au panier');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Mettre à jour la quantité d'un item
     */
    public function updateItem(UpdateCartItemRequest $request, CartItem $item): RedirectResponse
    {
        try {
            $this->cartService->updateQuantity(
                $item, 
                $request->validated('quantity'),
                $request->validated('specification_values')
            );
            
            return redirect()->back()->with('success', 'Quantité mise à jour');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Supprimer un item du panier
     */
    public function removeItem(CartItem $item): RedirectResponse
    {
        $this->cartService->removeItem($item);
        
        return redirect()->back()->with('success', 'Produit retiré du panier');
    }

    /**
     * Vider le panier
     */
    public function clear(): RedirectResponse
    {
        $cart = $this->cartService->getOrCreate(
            auth()->user()?->client?->id,
            session()->getId()
        );
        
        $this->cartService->clear($cart);
        
        return redirect()->back()->with('success', 'Panier vidé');
    }
}
