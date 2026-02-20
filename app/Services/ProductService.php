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
            ->select([
                'id',
                'sub_category_id',
                'name',
                'price',
                'stock',
                'status',
                'free_shipping',
                'created_at',
            ])
            ->with([
                // Minimal fields to reduce payload/time
                // name is JSON (translatable)
                'subCategory:id,category_id,name,active',
                'subCategory.category:id,name,active,image_path',
                'images' => function ($q) {
                    $q->select('id', 'product_id', 'url', 'is_main', 'is_primary')
                        ->orderBy('is_main', 'desc')
                        ->orderBy('is_primary', 'desc')
                        ->orderBy('id', 'asc');
                },
            ]);
        
        // Filtrer par catégorie (via la sous-catégorie)
        if ($filter->categoryId) {
            $query->whereHas('subCategory', function ($q) use ($filter) {
                $q->where('category_id', $filter->categoryId);
            });
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
            'variants' => function ($q) {
                $q->where('is_active', true)->orderBy('price', 'asc');
            },
            'variants.specifications',
        ])->findOrFail($productId);
    }
}
