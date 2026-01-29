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
            'loyaltyBalance' => auth()->check() && auth()->user()->client 
                ? app(\App\Services\LoyaltyService::class)->getBalance(auth()->user()->client->id) 
                : 0,
        ]);
    }

    /**
     * Calculer les frais de livraison (AJAX)
     */
    public function calculateShipping(CalculateShippingRequest $request): \Illuminate\Http\JsonResponse
    {
        try {
            $data = $request->validated();
            $wilayaId = (int) $data['wilaya_id'];
            $deliveryType = DeliveryType::from($data['delivery_type']);
            
            // 1. Toujours charger les communes (critique pour le front)
            $communes = $this->locationService->getCommunesByWilaya($wilayaId);
            
            // 2. Tenter de calculer le prix (optionnel pour le chargement des communes)
            $deliveryPrice = 0;
            $error = null;
            
            try {
                $deliveryPrice = $this->locationService->getDeliveryPrice($wilayaId, $deliveryType);
            } catch (\Exception $e) {
                // Log l'erreur ou ignorer si c'est juste un tarif manquant
                $error = $e->getMessage();
            }
            
            return response()->json([
                'delivery_price' => $deliveryPrice,
                'communes' => $communes,
                'shipping_error' => $error,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Valider un code promo (AJAX)
     */
    public function validatePromoCode(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate(['code' => 'required|string']);
        
        $promoCode = \App\Models\PromoCode::where('code', $request->code)
            ->where('is_active', true)
            ->first();
        
        if (!$promoCode) {
            return response()->json(['error' => 'Code promo invalide ou expiré'], 404);
        }
        
        $clientId = auth()->check() ? auth()->user()->client?->id : null;
        
        if (!$promoCode->isValid($clientId)) {
            return response()->json(['error' => 'Ce code promo ne peut pas être utilisé'], 403);
        }
        
        // Get cart total to calculate discount
        $cart = $this->cartService->getOrCreate(
            $clientId,
            session()->getId()
        );
        $cartTotal = $this->cartService->getTotal($cart);
        $discount = $promoCode->calculateDiscount($cartTotal);
        
        return response()->json([
            'code' => $promoCode->code,
            'discount' => $discount,
            'type' => $promoCode->type->value,
            'discount_value' => $promoCode->discount_value,
        ]);
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
