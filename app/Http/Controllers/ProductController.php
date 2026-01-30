<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DTOs\ProductFilterDTO;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use App\Models\ProductImage;
use App\Models\ProductSpecificationValue;
use App\Models\Specification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
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
            ->orderByName('asc')
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
    public function show(Request $request, int $id): Response
    {
        // ⚡️ OPTIMISATION SUCCESS : Si on renvoie un succès de commande, on "bail out" des données lourdes
        $isSuccess = session()->has('order');

        // ⚡️ CRITIQUE : Si on a une commande en session, retourner UNIQUEMENT les props minimales
        // pour éviter tout chargement lourd qui ralentit le redirect
        if ($isSuccess) {
            return Inertia::render('Products/Show', [
                'order' => session('order'),
                'newLoyaltyBalance' => session('newLoyaltyBalance'),
                'success' => session('success'),
                // Props vides pour éviter tout chargement
                'product' => null,
                'communes' => [],
                'delivery_tariffs' => [],
                'selected_tariff' => null,
                'relatedProducts' => [],
            ]);
        }

        return Inertia::render('Products/Show', [
            'product' => fn() => $this->productService->getWithDetails($id),
            
            // On ne charge les produits suggérés QUE si ce n'est pas un succès de commande
            'relatedProducts' => Inertia::lazy(function() use ($id, $isSuccess) {
                if ($isSuccess) return [];
                
                $product = Product::select('id', 'sub_category_id')->find($id);
                if (!$product) return [];
                
                return Product::where('sub_category_id', $product->sub_category_id)
                    ->where('id', '!=', $id)
                    ->active()
                    ->with(['images', 'specificationValues.specification'])
                    ->limit(4)
                    ->get();
            }),
            
            'communes' => fn () => ($isSuccess || !request('wilaya_id')) 
                ? [] 
                : app(\App\Services\LocationService::class)->getCommunesByWilaya((int)request('wilaya_id')),
            
            'delivery_tariffs' => Inertia::lazy(fn () => $isSuccess ? [] : \Illuminate\Support\Facades\Cache::rememberForever('delivery_tariffs', function () {
                return \App\Models\DeliveryTariff::where('is_active', true)->get()->groupBy('wilaya_id');
            })),

            'selected_tariff' => function() use ($isSuccess) {
                if ($isSuccess) return null;
                $wId = request('wilaya_id');
                if (!$wId) return null;

                return \App\Models\DeliveryTariff::where('wilaya_id', $wId)
                    ->where('is_active', true)
                    ->get()
                    ->mapWithKeys(fn($t) => [$t->type->value => (float)$t->price]);
            },

            'order' => session('order'), // Déjà flashé par CheckoutController
            'newLoyaltyBalance' => session('newLoyaltyBalance'), // Nouveau solde après commande
        ]);
    }

    /**
     * Enregistrer un nouveau produit (Admin)
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'sub_category_id' => 'required|exists:sub_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'images.*' => 'nullable|image|max:2048',
            'specifications' => 'nullable|array',
            'specifications.*.id' => 'required|exists:specifications,id',
            'specifications.*.value' => 'nullable|string',
        ]);

        $validator->after(function ($validator) use ($request) {
            $specifications = collect($request->input('specifications', []));
            if ($specifications->isEmpty()) {
                return;
            }

            $specIds = $specifications->pluck('id')->filter()->unique()->values();
            $specMap = Specification::whereIn('id', $specIds)->get()->keyBy('id');
            $allowedSpecIds = Specification::where('sub_category_id', $request->sub_category_id)->pluck('id')->all();

            foreach ($specifications as $index => $spec) {
                $specId = $spec['id'] ?? null;
                $value = $spec['value'] ?? null;

                if ($specId && !in_array($specId, $allowedSpecIds, true)) {
                    $validator->errors()->add("specifications.$index.id", "La spécification sélectionnée n'appartient pas à la sous-catégorie.");
                    continue;
                }

                if ($specId && ($specMap[$specId]->required ?? false) && ($value === null || $value === '')) {
                    $validator->errors()->add("specifications.$index.value", 'Cette spécification est obligatoire.');
                }
            }
        });

        $validated = $validator->validate();

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
                        'is_main' => $index === 0,
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
        $validator = Validator::make($request->all(), [
            'sub_category_id' => 'required|exists:sub_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'images.*' => 'nullable|image|max:2048',
            'specifications' => 'nullable|array',
            'specifications.*.id' => 'required|exists:specifications,id',
            'specifications.*.value' => 'nullable|string',
        ]);

        $validator->after(function ($validator) use ($request) {
            $specifications = collect($request->input('specifications', []));
            if ($specifications->isEmpty()) {
                return;
            }

            $specIds = $specifications->pluck('id')->filter()->unique()->values();
            $specMap = Specification::whereIn('id', $specIds)->get()->keyBy('id');
            $allowedSpecIds = Specification::where('sub_category_id', $request->sub_category_id)->pluck('id')->all();

            foreach ($specifications as $index => $spec) {
                $specId = $spec['id'] ?? null;
                $value = $spec['value'] ?? null;

                if ($specId && !in_array($specId, $allowedSpecIds, true)) {
                    $validator->errors()->add("specifications.$index.id", "La spécification sélectionnée n'appartient pas à la sous-catégorie.");
                    continue;
                }

                if ($specId && ($specMap[$specId]->required ?? false) && ($value === null || $value === '')) {
                    $validator->errors()->add("specifications.$index.value", 'Cette spécification est obligatoire.');
                }
            }
        });

        $validated = $validator->validate();

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
                        'is_main' => false,
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
