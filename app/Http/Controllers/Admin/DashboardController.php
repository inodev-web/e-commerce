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
        \Log::info('DashboardController - Loading stats', [
            'total_orders' => Order::count(),
            'orders_by_status' => Order::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
                ->toArray(),
        ]);
        
        // Statistiques globales
        $totalOrders = Order::count();
        
        // Try to find delivered orders - check for both enum and lowercase
        $deliveredStatus = OrderStatus::DELIVERED->value;
        $totalRevenue = Order::where('status', $deliveredStatus)->sum('total_price');
        
        // If no revenue with enum, try lowercase
        if ($totalRevenue == 0) {
            $totalRevenue = Order::where('status', strtolower($deliveredStatus))->sum('total_price');
        }
        
        $pendingOrders = Order::where('status', OrderStatus::PENDING->value)->count();
        $lowStockProducts = Product::where('stock', '<', 10)->count();
        
        // Ventes par wilaya (Top 10)
        $salesByWilaya = DB::table('orders')
            ->select('wilaya_name', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(total_price) as revenue'))
            ->where('status', $deliveredStatus)
            ->groupBy('wilaya_name')
            ->orderBy('revenue', 'desc')
            ->limit(10)
            ->get();
        
        // If no results with enum, try lowercase
        if ($salesByWilaya->isEmpty()) {
            $salesByWilaya = DB::table('orders')
                ->select('wilaya_name', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(total_price) as revenue'))
                ->where('status', strtolower($deliveredStatus))
                ->groupBy('wilaya_name')
                ->orderBy('revenue', 'desc')
                ->limit(10)
                ->get();
        }
        
        // Commandes récentes
        $recentOrders = Order::with('items.product.images')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        // Revenus par jour (7 derniers jours)
        $revenueByDay = DB::table('orders')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as revenue'))
            ->where('status', $deliveredStatus)
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();
        
        // If no results with enum, try lowercase
        if ($revenueByDay->isEmpty()) {
            $revenueByDay = DB::table('orders')
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as revenue'))
                ->where('status', strtolower($deliveredStatus))
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get();
        }
        
        // Produits les plus vendus
        $topProducts = DB::table('order_items')
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', $deliveredStatus)
            ->groupBy('product_id')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return Product::with('images')->find($item->product_id);
            });
        
        \Log::info('DashboardController - Stats calculated', [
            'totalRevenue' => $totalRevenue,
            'salesByWilaya_count' => $salesByWilaya->count(),
            'revenueByDay_count' => $revenueByDay->count(),
            'topProducts_count' => $topProducts->count(),
        ]);
        
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalRevenue' => number_format((float)$totalRevenue, 2),
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
