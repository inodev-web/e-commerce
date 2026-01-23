<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DTOs\ProductFilterDTO;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use App\Models\ProductImage;
use App\Models\ProductSpecificationValue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\Laravel\Facades\Image;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    /**
     * Lister les produits avec filtres
     */
    public function index(Request $request): Response
    {
        $filterDTO = ProductFilterDTO::fromRequest($request->all());
        
        $products = $this->productService->list($filterDTO, 20);
        
        $categories = Category::active()
            ->with('subCategories')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only([
                'category_id',
                'sub_category_id',
                'min_price',
                'max_price',
                'search',
                'in_stock_only',
            ]),
        ]);
    }

    /**
     * Afficher un produit
     */
    public function show(Product $product): Response
    {
        $product = $this->productService->getWithDetails($product->id);
        
        // Produits similaires
        $relatedProducts = Product::where('sub_category_id', $product->sub_category_id)
            ->where('id', '!=', $product->id)
            ->active()
            ->with('images')
            ->limit(4)
            ->get();
        
        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Enregistrer un nouveau produit (Admin)
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sub_category_id' => 'required|exists:sub_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => 'required|string',
            'images.*' => 'nullable|image|max:2048',
            'specifications' => 'nullable|array',
            'specifications.*.id' => 'required|exists:specifications,id',
            'specifications.*.value' => 'required|string',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $product = Product::create($validated);

            // Gérer les images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $imageFile) {
                    $filename = uniqid() . '.webp';
                    $path = 'products/' . $filename;
                    
                    // Optimisation avec Intervention Image v3
                    $image = Image::read($imageFile);
                    $image->cover(800, 800);
                    
                    Storage::disk('public')->put($path, (string) $image->encodeByMediaType('image/webp', quality: 80));

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'is_primary' => $index === 0,
                    ]);
                }
            }

            // Gérer les spécifications
            if (!empty($validated['specifications'])) {
                foreach ($validated['specifications'] as $spec) {
                    ProductSpecificationValue::create([
                        'product_id' => $product->id,
                        'specification_id' => $spec['id'],
                        'value' => $spec['value'],
                    ]);
                }
            }
        });

        return redirect()->route('admin.dashboard')->with('success', 'Produit créé avec succès.');
    }

    /**
     * Mettre à jour un produit (Admin)
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'sub_category_id' => 'required|exists:sub_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => 'required|string',
            'images.*' => 'nullable|image|max:2048',
            'specifications' => 'nullable|array',
            'specifications.*.id' => 'required|exists:specifications,id',
            'specifications.*.value' => 'required|string',
        ]);

        DB::transaction(function () use ($validated, $request, $product) {
            $product->update($validated);

            // Gérer les nouvelles images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $imageFile) {
                    $filename = uniqid() . '.webp';
                    $path = 'products/' . $filename;

                    $image = Image::read($imageFile);
                    $image->cover(800, 800);
                    
                    Storage::disk('public')->put($path, (string) $image->encodeByMediaType('image/webp', quality: 80));

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'is_primary' => false,
                    ]);
                }
            }

            // Mettre à jour les spécifications
            if (isset($validated['specifications'])) {
                $product->specificationValues()->delete();
                foreach ($validated['specifications'] as $spec) {
                    ProductSpecificationValue::create([
                        'product_id' => $product->id,
                        'specification_id' => $spec['id'],
                        'value' => $spec['value'],
                    ]);
                }
            }
        });

        return back()->with('success', 'Produit mis à jour avec succès.');
    }

    /**
     * Supprimer un produit (Admin)
     */
    public function destroy(Product $product): RedirectResponse
    {
        DB::transaction(function () use ($product) {
            // Optionnel: supprimer les images du stockage
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_path);
            }
            
            $product->images()->delete();
            $product->specificationValues()->delete();
            $product->delete();
        });

        return back()->with('success', 'Produit supprimé avec succès.');
    }
}
