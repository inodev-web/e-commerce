<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SearchController - API de recherche en temps réel pour produits
 *
 * Endpoint: GET /api/search?q=query
 * Retourne: JSON avec produits correspondants (max 4 résultats)
 */
class SearchController extends Controller
{
    /**
     * Recherche les produits par nom ou description
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
                'count' => 0,
                'message' => 'Veuillez entrer au moins 2 caractères'
            ]);
        }

        try {
            $lowerQuery = strtolower($searchQuery);

            // Récupérer tous les produits actifs avec leurs images
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
                $aDesc = strtolower(is_array($a->description) ? json_encode($a->description) : ($a->description ?? ''));

                $bName = strtolower($b->name ?? '');
                $bNameAr = strtolower($b->name_ar ?? '');
                $bDesc = strtolower(is_array($b->description) ? json_encode($b->description) : ($b->description ?? ''));

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
            $products = $sorted->take(4)->values();

            // Formater les résultats pour le frontend
            $data = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'name_ar' => $product->name_ar ?? '',
                    'price' => $product->price,
                    'slug' => $product->slug ?? $this->generateSlug($product->name),
                    'image' => $product->images->first()
                        ? config('app.url') . '/storage/' . $product->images->first()->image_path
                        : null,
                    'category' => $product->subCategory?->name ?? 'Parapharmacie',
                    'url' => route('products.show', $product->id),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
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
