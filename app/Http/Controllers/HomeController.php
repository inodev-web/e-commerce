<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Affiche la page d'accueil avec les produits mis en avant
     */
    public function index(): Response
    {
        $featuredProducts = Product::active()
            ->with(['images', 'subCategory'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();
        
        $topSellers = Product::active()
            ->with(['images', 'subCategory'])
            ->orderBy('stock', 'asc') // Simulation de top sellers par faible stock (vente rapide)
            ->limit(4)
            ->get();
            
        $categories = Category::active()->limit(6)->get();

        return Inertia::render('HomePage', [
            'featuredProducts' => $featuredProducts,
            'topSellers' => $topSellers,
            'categories' => $categories,
        ]);
    }
}
