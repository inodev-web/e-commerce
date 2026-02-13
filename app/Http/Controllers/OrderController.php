<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * Lister les commandes de l'utilisateur connecté
     */
    public function index()
    {
        // Les admins gardent l'accès à la liste globale (ou via dashboard)
        if (auth()->user()->hasRole('admin')) {
            $orders = Order::with('items.product.images', 'client')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
            return Inertia::render('Orders/Index', [
                'orders' => $orders,
            ]);
        }

        // Les clients sont redirigés vers leur profil unifié
        return redirect()->route('profile.edit', ['tab' => 'orders']);
    }

    /**
     * Afficher les détails d'une commande
     */
    public function show(Order $order): Response
    {
        // Vérifier que la commande appartient au client
        $client = auth()->user()->client;
        
        if ($order->client_id !== $client?->id && !auth()->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }
        
        $order->load(['items']);
        
        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Annuler une commande
     */
    public function cancel(Order $order): RedirectResponse
    {
        try {
            $client = auth()->user()->client;
            
            if ($order->client_id !== $client->id) {
                abort(403, 'Unauthorized');
            }
            
            $this->orderService->cancel($order);
            
            return redirect()->back()->with('success', 'Commande annulée avec succès');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
