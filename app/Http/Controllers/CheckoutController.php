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
use Illuminate\Http\Request;
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
    public function show(Request $request): Response
    {
        // ⚡️ OPTIMISATION TOTALE : Toutes les props sont des closures
        return Inertia::render('Checkout/Show', [
            'cart' => fn() => $this->cartService->getOrCreate(
                auth()->user()?->client?->id,
                session()->getId()
            ),
            
            'items' => fn() => $this->cartService->getItemsWithProducts(
                $this->cartService->getOrCreate(auth()->user()?->client?->id, session()->getId())
            ),
            
            'productsTotal' => fn() => $this->cartService->getTotal(
                $this->cartService->getOrCreate(auth()->user()?->client?->id, session()->getId())
            ),
            
            'wilayas' => fn() => $this->locationService->getWilayasWithTariffs(),
            
            'communes' => fn() => request('wilaya_id') 
                ? $this->locationService->getCommunesByWilaya((int)request('wilaya_id')) 
                : [],
                
            'delivery_tariffs' => Inertia::lazy(fn () => \Illuminate\Support\Facades\Cache::rememberForever('delivery_tariffs', function () {
                return \App\Models\DeliveryTariff::where('is_active', true)->get()->groupBy('wilaya_id');
            })),

            'selected_tariff' => function() {
                $wId = request('wilaya_id');
                if (!$wId) return null;
                
                return \App\Models\DeliveryTariff::where('wilaya_id', $wId)
                    ->where('is_active', true)
                    ->get()
                    ->mapWithKeys(fn($t) => [$t->type->value => (float)$t->price]);
            },

            'deliveryTypes' => fn() => [
                ['value' => DeliveryType::DOMICILE->value, 'label' => DeliveryType::DOMICILE->label()],
                ['value' => DeliveryType::BUREAU->value, 'label' => DeliveryType::BUREAU->label()],
            ],
            
            'loyaltyBalance' => fn() => auth()->check() && auth()->user()->client 
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
        $request->validate([
            'code' => 'required|string',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $code = strtoupper(trim($request->code));
        $amount = $request->amount;

        if ($amount === null || $amount <= 0) {
            $clientId = auth()->check() ? auth()->user()->client?->id : null;
            $cart = $this->cartService->getOrCreate(
                $clientId,
                session()->getId()
            );
            $amount = $this->cartService->getTotal($cart);
        }

        // 1) Promo codes from admin
        $promoCode = \App\Models\PromoCode::where('code', $code)
            ->where('is_active', true)
            ->first();

        if ($promoCode) {
            $clientId = auth()->check() ? auth()->user()->client?->id : null;
            if (!$promoCode->isValid($clientId)) {
                return response()->json(['error' => 'Ce code promo ne peut pas être utilisé'], 403);
            }

            $discount = min($promoCode->calculateDiscount((float) $amount), (float) $amount);

            return response()->json([
                'code' => $promoCode->code,
                'discount' => $discount,
                'type' => $promoCode->type->value,
                'discount_value' => $promoCode->discount_value,
            ]);
        }

        // 2) Referral codes from clients
        $referrer = \App\Models\User::where('referral_code', $code)->first();

        if (!$referrer || !$referrer->client) {
            return response()->json(['error' => 'Code promo invalide ou expiré'], 404);
        }

        $currentUserId = auth()->id();
        if ($currentUserId && $referrer->id === $currentUserId) {
            return response()->json(['error' => 'Vous ne pouvez pas utiliser votre propre code'], 403);
        }

        $settings = \App\Models\LoyaltySetting::first();
        $discountAmount = $settings?->referral_discount_amount ?? 0;
        if ($discountAmount <= 0) {
            return response()->json(['error' => 'Code promo invalide ou expiré'], 404);
        }

        $discount = min((float) $discountAmount, (float) $amount);

        return response()->json([
            'code' => $code,
            'discount' => $discount,
            'type' => 'REFERRAL',
            'discount_value' => $discountAmount,
        ]);
    }
    /**
     * Passer la commande avec validation et réponse SPA optimisée
     */
    public function placeOrder(PlaceOrderRequest $request)
    {
        try {
            $data = $request->validated();
            $isDirect = $request->has('items');
            
            \Log::info('CheckoutController - placeOrder', [
                'has_items' => $isDirect,
                'request_items' => $request->input('items'),
                'data' => $data,
                'use_loyalty_points' => $data['use_loyalty_points'] ?? 'NOT SET',
                'user_id' => auth()->id(),
                'client_id' => auth()->user()?->client?->id,
            ]);
            
            $dto = CreateOrderDTO::fromRequest([
                ...$data,
                'client_id' => auth()->user()?->client?->id,
                'items' => $isDirect ? $request->input('items') : $this->prepareCartItems(),
                'clear_cart' => !$isDirect,
            ]);
            
            \Log::info('CheckoutController - DTO created', ['items' => $dto->items]);
            
            $order = $this->orderService->create($dto);
            
            \Log::info('CheckoutController - Order created', ['order_id' => $order->id, 'items_count' => $order->items()->count()]);
            
            // ⚡️ OPTIMISATION RADICALE : Calculer les nouveaux points AVANT la réponse
            $newLoyaltyBalance = 0;
            if ($dto->clientId) {
                // Invalider le cache des points pour ce client (AVANT de récupérer le solde)
                \Illuminate\Support\Facades\Cache::forget("loyalty_balance_{$dto->clientId}");
                $newLoyaltyBalance = app(\App\Services\LoyaltyService::class)->getBalance($dto->clientId);
            }
            
            // ⚡️ OPTIMISATION RADICALE : Réponse minimale SANS redirect pour éviter le 302
            // Si c'est une commande directe depuis la page produit, on retourne juste les données minimales en session
            // Le frontend utilisera ces données sans rechargement grâce à preserveState
            $orderData = [
                'id' => $order->id,
                'first_name' => $order->first_name,
                'total_price' => $order->total_price,
                'commune_name' => $order->commune_name,
                'wilaya_name' => $order->wilaya_name,
            ];
            
            // Stocker en session pour que le frontend puisse y accéder
            session()->flash('order', $orderData);
            session()->flash('newLoyaltyBalance', $newLoyaltyBalance);
            session()->flash('success', "Commande #{$order->id} créée avec succès!");
            
            // ⚡️ CRITIQUE : Redirection vers la page de succès dédiée
            return redirect()->route('checkout.success', $order)->with([
                'success' => "Commande #{$order->id} créée avec succès!"
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Checkout Error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->only(['first_name', 'last_name', 'phone', 'wilaya_id', 'commune_id', 'delivery_type']),
            ]);
            
            // Retourner les erreurs au format Inertia
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Page de confirmation - ⚡️ OPTIMISATION : Payload minimal
     */
    public function success(\App\Models\Order $order): Response
    {
        // On ne charge QUE ce qui est nécessaire pour l'affichage du succès
        // Les snapshots dans items suffisent généralement
        $order->load(['items' => function($q) {
            $q->select('id', 'order_id', 'product_id', 'quantity', 'price_snapshot', 'metadata_snapshot');
        }]);
        
        return Inertia::render('Checkout/Success', [
            'order' => $order,
            'newLoyaltyBalance' => session('newLoyaltyBalance'),
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
            $specificationValues = $item->specification_values;
            
            if (empty($specificationValues) && $item->productVariant) {
                $specificationValues = $item->productVariant->getSpecificationIdsAndValues();
            }
            
            $items[$item->product_id] = [
                'quantity' => $item->quantity,
                'product_variant_id' => $item->product_variant_id,
                'specification_values' => $specificationValues, 
            ];
        }
        
        return $items;
    }
}




