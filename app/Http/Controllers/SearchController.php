<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SearchController - API de recherche en temps réel pour produits et catégories
 *
 * Endpoint: GET /api/search?q=query
 * Retourne: JSON avec produits et catégories correspondants
 */
class SearchController extends Controller
{
    /**
     * Recherche les produits et catégories par nom ou description
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function query(Request $request): JsonResponse
    {
        // Valider et récupérer la requête
        $searchQuery = $request->query('q', '');

        // Valider longueur minimale (2 caractères)
        if (strlen(trim($searchQuery)) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
                'categories' => [],
                'count' => 0,
                'message' => 'Veuillez entrer au moins 2 caractères'
            ]);
        }

        try {
            $lowerQuery = strtolower($searchQuery);

            // ── Search Categories ──
            $allCategories = Category::active()->get();

            $matchedCategories = $allCategories->filter(function ($category) use ($lowerQuery) {
                $nameValue = $category->getAttributes()['name'] ?? null;
                if (!$nameValue) return false;

                $decoded = is_string($nameValue) ? json_decode($nameValue, true) : $nameValue;
                if (!is_array($decoded)) return false;

                foreach ($decoded as $locale => $text) {
                    if ($text && str_contains(strtolower($text), $lowerQuery)) {
                        return true;
                    }
                }
                return false;
            })->sortBy(function ($category) use ($lowerQuery) {
                $nameValue = $category->getAttributes()['name'] ?? '';
                $decoded = is_string($nameValue) ? json_decode($nameValue, true) : $nameValue;
                if (!is_array($decoded)) return 3;
                
                $score = 3;
                foreach ($decoded as $locale => $text) {
                    $lowerText = strtolower($text);
                    if ($lowerText === $lowerQuery) return 0;
                    if (str_starts_with($lowerText, $lowerQuery)) $score = min($score, 1);
                    if (str_contains($lowerText, $lowerQuery)) $score = min($score, 2);
                }
                return $score;
            })->take(20)->values();

            $categoryData = $matchedCategories->map(function ($category) {
                // Count products via subCategories since Product is linked to SubCategory
                $productsCount = \App\Models\Product::active()
                    ->whereIn('sub_category_id', $category->subCategories()->pluck('id'))
                    ->count();

                return [
                    'id' => 'cat_' . $category->id,
                    'name' => $category->name,
                    'image' => $category->image_path ? asset('storage/' . $category->image_path) : null,
                    'url' => route('products.index', ['category_id' => $category->id]),
                    'is_sub' => false,
                    'products_count' => $productsCount,
                ];
            });

            // ── Search SubCategories ──
            $allSubCategories = \App\Models\SubCategory::active()->with('category')->get();

            $matchedSubCategories = $allSubCategories->filter(function ($subCategory) use ($lowerQuery) {
                if (!$subCategory->category) return false;
                
                $nameValue = $subCategory->getAttributes()['name'] ?? null;
                if (!$nameValue) return false;

                $decoded = is_string($nameValue) ? json_decode($nameValue, true) : $nameValue;
                if (!is_array($decoded)) return false;

                foreach ($decoded as $locale => $text) {
                    if ($text && str_contains(strtolower($text), $lowerQuery)) {
                        return true;
                    }
                }
                return false;
            })->sortBy(function ($subCategory) use ($lowerQuery) {
                $nameValue = $subCategory->getAttributes()['name'] ?? '';
                $decoded = is_string($nameValue) ? json_decode($nameValue, true) : $nameValue;
                if (!is_array($decoded)) return 3;
                
                $score = 3;
                foreach ($decoded as $locale => $text) {
                    $lowerText = strtolower($text);
                    if ($lowerText === $lowerQuery) return 0;
                    if (str_starts_with($lowerText, $lowerQuery)) $score = min($score, 1);
                    if (str_contains($lowerText, $lowerQuery)) $score = min($score, 2);
                }
                return $score;
            })->take(20)->values();

            $subCategoryData = $matchedSubCategories->map(function ($subCategory) {
                return [
                    'id' => 'subcat_' . $subCategory->id,
                    'name' => $subCategory->name,
                    'category_name' => $subCategory->category->name,
                    'image' => $subCategory->category->image_path ? asset('storage/' . $subCategory->category->image_path) : null,
                    'url' => route('products.index', ['sub_category_id' => $subCategory->id]),
                    'is_sub' => true,
                    'products_count' => \App\Models\Product::active()->where('sub_category_id', $subCategory->id)->count(),
                ];
            });

            $categoryData = $categoryData->concat($subCategoryData);

            // ── Search Products ──
            $allProducts = Product::active()
                ->with('images', 'subCategory')
                ->get();

            // Filtrer en PHP pour éviter les problèmes PostgreSQL JSON
            $filtered = $allProducts->filter(function ($product) use ($lowerQuery) {
                $name = strtolower($product->name ?? '');
                $nameAr = strtolower($product->name_ar ?? '');

                // Convertir description en string si c'est un JSON
                $description = '';
                if ($product->description) {
                    if (is_array($product->description) || is_object($product->description)) {
                        $description = strtolower(json_encode($product->description));
                    } else {
                        $description = strtolower($product->description);
                    }
                }

                return str_contains($name, $lowerQuery) ||
                       str_contains($nameAr, $lowerQuery) ||
                       str_contains($description, $lowerQuery);
            });

            // Trier par priorité (nom > name_ar > description)
            $sorted = $filtered->sort(function ($a, $b) use ($lowerQuery) {
                $aName = strtolower($a->name ?? '');
                $aNameAr = strtolower($a->name_ar ?? '');

                $bName = strtolower($b->name ?? '');
                $bNameAr = strtolower($b->name_ar ?? '');

                // Score pour produit A
                $aScore = 5;
                if ($aName === $lowerQuery || $aNameAr === $lowerQuery) $aScore = 0;
                elseif (str_starts_with($aName, $lowerQuery) || str_starts_with($aNameAr, $lowerQuery)) $aScore = 1;
                elseif (str_contains($aName, $lowerQuery)) $aScore = 2;
                elseif (str_contains($aNameAr, $lowerQuery)) $aScore = 3;
                else $aScore = 4;

                // Score pour produit B
                $bScore = 5;
                if ($bName === $lowerQuery || $bNameAr === $lowerQuery) $bScore = 0;
                elseif (str_starts_with($bName, $lowerQuery) || str_starts_with($bNameAr, $lowerQuery)) $bScore = 1;
                elseif (str_contains($bName, $lowerQuery)) $bScore = 2;
                elseif (str_contains($bNameAr, $lowerQuery)) $bScore = 3;
                else $bScore = 4;

                return $aScore <=> $bScore;
            });

            // Prendre les 20 premiers
            $products = $sorted->take(20)->values();

            // Formater les résultats pour le frontend
            $data = $products->map(function ($product) {
                // Récupérer la première image
                $firstImage = $product->images->first();
                $imageUrl = null;

                if ($firstImage) {
                    // Utiliser asset() pour gérer correctement le lien symbolique
                    $imageUrl = asset('storage/' . $firstImage->image_path);
                }

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'name_ar' => $product->name_ar ?? '',
                    'price' => $product->price,
                    'slug' => $product->slug ?? $this->generateSlug($product->name),
                    'image' => $imageUrl,
                    'category' => $product->subCategory?->name ?? 'Parapharmacie',
                    'url' => route('products.show', $product->id),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'categories' => $categoryData,
                'count' => $data->count(),
                'query' => $searchQuery
            ]);

        } catch (\Exception $e) {
            // Log l'erreur silencieusement
            \Log::error('Search error', [
                'query' => $searchQuery,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'data' => [],
                'categories' => [],
                'count' => 0,
                'message' => 'Erreur lors de la recherche'
            ], 500);
        }
    }

    /**
     * Génère un slug à partir d'un texte
     * Fallback si slug n'existe pas en database
     *
     * @param string $text
     * @return string
     */
    private function generateSlug(string $text): string
    {
        return \Illuminate\Support\Str::slug($text, '-');
    }
}
