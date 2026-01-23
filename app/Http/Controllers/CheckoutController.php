<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DTOs\CreateOrderDTO;
use App\Enums\DeliveryType;
use App\Http\Requests\CalculateShippingRequest;
use App\Http\Requests\PlaceOrderRequest;
use App\Services\CartService;
use App\Services\LocationService;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly LocationService $locationService,
        private readonly OrderService $orderService,
    ) {}

    /**
     * Afficher la page de checkout avec wilayas et tarifs DYNAMIQUES
     */
    public function show(): Response
    {
        $cart = $this->cartService->getOrCreate(
            auth()->user()?->client?->id,
            session()->getId()
        );
        
        $items = $this->cartService->getItemsWithProducts($cart);
        $productsTotal = $this->cartService->getTotal($cart);
        
        // CRITIQUE: Envoyer les wilayas avec leurs tarifs DYNAMIQUES au front React
        $wilayasWithTariffs = $this->locationService->getWilayasWithTariffs();
        
        return Inertia::render('Checkout/Show', [
            'cart' => $cart,
            'items' => $items,
            'productsTotal' => $productsTotal,
            'wilayas' => $wilayasWithTariffs,
            'deliveryTypes' => [
                ['value' => DeliveryType::DOMICILE->value, 'label' => DeliveryType::DOMICILE->label()],
                ['value' => DeliveryType::BUREAU->value, 'label' => DeliveryType::BUREAU->label()],
            ],
        ]);
    }

    /**
     * Calculer les frais de livraison (AJAX)
     */
    public function calculateShipping(CalculateShippingRequest $request): \Illuminate\Http\JsonResponse
    {
        try {
            $data = $request->validated();
            
            $deliveryPrice = $this->locationService->getDeliveryPrice(
                (int) $data['wilaya_id'],
                DeliveryType::from($data['delivery_type'])
            );
            
            $communes = $this->locationService->getCommunesByWilaya((int) $data['wilaya_id']);
            
            return response()->json([
                'delivery_price' => $deliveryPrice,
                'communes' => $communes,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Passer la commande avec validation et redirection Inertia
     */
    public function placeOrder(PlaceOrderRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            
            // Construire le DTO
            $dto = CreateOrderDTO::fromRequest([
                ...$data,
                'client_id' => auth()->user()?->client?->id,
                'items' => $this->prepareCartItems(),
            ]);
            
            // Créer la commande via le service (transaction DB + snapshots)
            $order = $this->orderService->create($dto);
            
            return redirect()->route('checkout.success', $order)
                ->with('success', "Commande #{$order->id} créée avec succès!");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Page de confirmation
     */
    public function success(\App\Models\Order $order): Response
    {
        $order->load(['items.product.images']);
        
        return Inertia::render('Checkout/Success', [
            'order' => $order,
        ]);
    }

    /**
     * Préparer les items du panier pour la commande
     */
    private function prepareCartItems(): array
    {
        $cart = $this->cartService->getOrCreate(
            auth()->user()?->client?->id,
            session()->getId()
        );
        
        $items = [];
        foreach ($cart->items as $item) {
            $items[$item->product_id] = ['quantity' => $item->quantity];
        }
        
        return $items;
    }
}
