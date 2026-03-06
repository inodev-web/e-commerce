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
            })->take(20)->values();

            $categoryData = $matchedCategories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'image' => $category->image_path ? asset('storage/' . $category->image_path) : null,
                    'url' => route('products.index', ['category_id' => $category->id]),
                ];
            });

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
                $aScore = 3;
                if (str_contains($aName, $lowerQuery)) $aScore = 1;
                elseif (str_contains($aNameAr, $lowerQuery)) $aScore = 2;

                // Score pour produit B
                $bScore = 3;
                if (str_contains($bName, $lowerQuery)) $bScore = 1;
                elseif (str_contains($bNameAr, $lowerQuery)) $bScore = 2;

                return $aScore <=> $bScore;
            });

            // Prendre les 4 premiers
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
