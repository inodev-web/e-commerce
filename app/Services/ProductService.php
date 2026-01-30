<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\ProductFilterDTO;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    /**
     * Lister les produits avec filtres
     */
    public function list(ProductFilterDTO $filter, int $perPage = 20): LengthAwarePaginator
    {
        $query = Product::query()
            ->with([
                'subCategory.category', 
                'images' => function ($q) {
                    $q->orderBy('is_main', 'desc');
                }
            ]);
        
        // Filtrer par catégorie
        if ($filter->categoryId) {
            $query->where('category_id', $filter->categoryId);
        }
        
        // Filtrer par sous-catégorie
        if ($filter->subCategoryId) {
            $query->where('sub_category_id', $filter->subCategoryId);
        }
        
        // Filtrer par status
        if ($filter->status) {
            $query->where('status', $filter->status);
        }
        
        // Filtrer par prix
        if ($filter->minPrice !== null) {
            $query->where('price', '>=', $filter->minPrice);
        }
        
        if ($filter->maxPrice !== null) {
            $query->where('price', '<=', $filter->maxPrice);
        }
        
        // Recherche
        if ($filter->search) {
            $query->where(function ($q) use ($filter) {
                $q->where('name', 'ILIKE', "%{$filter->search}%")
                  ->orWhere('description', 'ILIKE', "%{$filter->search}%");
            });
        }
        
        // En stock uniquement
        if ($filter->inStockOnly) {
            $query->where('stock', '>', 0);
        }
        
        // Tri
        $query->orderBy($filter->sortBy, $filter->sortDirection);
        
        return $query->paginate($perPage);
    }

    /**
     * Obtenir un produit avec toutes ses relations
     */
    public function getWithDetails(int $productId): Product
    {
        return Product::with([
            'subCategory.category',
            'images',
            'specificationValues.specification',
        ])->findOrFail($productId);
    }
}
