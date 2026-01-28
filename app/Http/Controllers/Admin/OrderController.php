<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display all orders for admin
     */
    public function index(Request $request): Response
    {
        $query = Order::with(['items.product.images'])
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                    ->orWhere('last_name', 'like', '%' . $request->search . '%')
                    ->orWhere('phone', 'like', '%' . $request->search . '%')
                    ->orWhere('id', 'like', '%' . $request->search . '%');
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply wilaya filter
        if ($request->filled('wilaya')) {
            $query->where('wilaya_name', $request->wilaya);
        }

        $orders = $query->paginate(20);

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'wilaya']),
        ]);
    }

    /**
     * Display a specific order
     */
    public function show(Order $order): Response
    {
        $order->load(['items.product.images']);

        return Inertia::render('Admin/OrderDetails', [
            'order' => $order,
        ]);
    }
}
