<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // Middleware is handled in routes\web.php

    /**
     * Dashboard admin avec statistiques de ventes par wilaya et revenus
     */
    public function index(): Response
    {
        // Statistiques globales
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', OrderStatus::DELIVERED)->sum('total_price');
        $pendingOrders = Order::where('status', OrderStatus::PENDING)->count();
        $lowStockProducts = Product::where('stock', '<', 10)->count();
        
        // Ventes par wilaya (Top 10)
        $salesByWilaya = DB::table('orders')
            ->select('wilaya_name', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(total_price) as revenue'))
            ->where('status', OrderStatus::DELIVERED)
            ->groupBy('wilaya_name')
            ->orderBy('revenue', 'desc')
            ->limit(10)
            ->get();
        
        // Commandes récentes
        $recentOrders = Order::with('items.product.images')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        // Revenus par jour (7 derniers jours)
        $revenueByDay = DB::table('orders')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as revenue'))
            ->where('status', OrderStatus::DELIVERED)
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();
        
        // Produits les plus vendus
        $topProducts = DB::table('order_items')
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', OrderStatus::DELIVERED)
            ->groupBy('product_id')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return Product::with('images')->find($item->product_id);
            });
        
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalRevenue' => number_format($totalRevenue, 2),
                'pendingOrders' => $pendingOrders,
                'lowStockProducts' => $lowStockProducts,
            ],
            'salesByWilaya' => $salesByWilaya,
            'recentOrders' => $recentOrders,
            'revenueByDay' => $revenueByDay,
            'topProducts' => $topProducts,
        ]);
    }
}
