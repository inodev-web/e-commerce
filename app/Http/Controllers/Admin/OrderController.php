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
        // Use eager loading for minimal relations needed for the list
        $query = Order::with(['client', 'items']) 
            ->orderBy('created_at', 'desc');

        // Apply search filter - Robust SQL
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', $search);
                } else {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('id', 'like', "%{$search}%");
                }
            });
        }

        // Apply status filter - ensuring it matches Enum values (uppercase)
        if ($request->filled('status')) {
            $status = strtoupper($request->status);
            if ($status !== 'ALL') {
                $query->where('status', $status);
            }
        }

        // Apply wilaya filter
        if ($request->filled('wilaya')) {
            $query->where('wilaya_name', $request->wilaya);
        }

        $orders = $query->paginate(20)->withQueryString();

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
