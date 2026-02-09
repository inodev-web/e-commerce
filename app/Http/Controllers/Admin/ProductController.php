<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
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
// Image processing is optional; we fall back to storing originals if Intervention is not installed.

class ProductController extends Controller
{
    /**
     * Display admin products page
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['images', 'subCategory.category', 'specificationValues.specification'])
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $search = $request->search;
                $q->where('name->fr', 'ILIKE', "%{$search}%")
                  ->orWhere('name->ar', 'ILIKE', "%{$search}%")
                  ->orWhere('description->fr', 'ILIKE', "%{$search}%")
                  ->orWhere('description->ar', 'ILIKE', "%{$search}%");
            });
        }

        // Apply category filter
        if ($request->filled('category_id')) {
            $query->whereHas('subCategory', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // Apply subcategory filter
        if ($request->filled('sub_category_id')) {
            $query->where('sub_category_id', $request->sub_category_id);
        }

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->paginate(20)->withQueryString();

        $categories = Category::with('subCategories.specifications')
            ->orderByName('asc')
            ->get();

        return Inertia::render('Admin/Products', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'sub_category_id', 'status']),
        ]);
    }

    /**
     * Store a new product
     */
    public function store(Request $request): RedirectResponse
    {
        \Log::info('Product Store Request Data:', $request->all());
        \Log::info('Product Store Files:', $request->allFiles());
        \Log::info('Has images file:', [$request->hasFile('images')]);
        \Log::info('Product Store DB:', [
            'default' => config('database.default'),
            'database' => DB::connection()->getDatabaseName(),
        ]);
        
        $rules = [
            'sub_category_id' => 'required|exists:sub_categories,id',
            'name' => 'required|array',
            'name.fr' => 'required|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'description' => 'required|array',
            'description.fr' => 'nullable|string',
            'description.ar' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'free_shipping' => 'nullable|boolean',
            'images' => 'nullable|array',
            // 5MB per image (Laravel uses KB)
            'images.*' => 'nullable|image|max:5120',
            'specifications' => 'nullable|array',
            'specifications.*.id' => 'required|exists:specifications,id',
            'specifications.*.value' => 'nullable|string',
            'specifications.*.selectedQuantities' => 'nullable|array',
            'specifications.*.selectedQuantities.*' => 'nullable|integer|min:0',
        ];

        $validator = Validator::make($request->all(), $rules);

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
                $selectedQuantities = $spec['selectedQuantities'] ?? null;
                $hasQuantities = is_array($selectedQuantities) && collect($selectedQuantities)->filter(fn ($qty) => (int) $qty > 0)->isNotEmpty();

                // IDs can arrive as strings from the frontend; normalize to int for strict comparisons.
                $normalizedSpecId = is_numeric($specId) ? (int) $specId : $specId;

                if ($specId && !in_array($normalizedSpecId, $allowedSpecIds, true)) {
                    $validator->errors()->add("specifications.$index.id", "La spécification sélectionnée n'appartient pas à la sous-catégorie.");
                    continue;
                }

                if ($specId) {
                    $mapKey = is_numeric($specId) ? (int) $specId : $specId;
                    if (($specMap[$mapKey]->required ?? false) && !$hasQuantities && ($value === null || $value === '')) {
                        $validator->errors()->add("specifications.$index.value", 'Cette spécification est obligatoire.');
                    }
                }
            }
        });

        if ($validator->fails()) {
            \Log::warning('Product Store Validation Failed', [
                'errors' => $validator->errors()->toArray(),
            ]);
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();
        \Log::info('Product Store Validation Passed', [
            'keys' => array_keys($validated),
        ]);

        try {
            DB::transaction(function () use ($validated, $request) {
                $product = Product::create($validated);
                \Log::info('Product Created', ['id' => $product->id]);

                // Handle images
                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $index => $imageFile) {
                        $path = null;

                        // If Intervention Image is available, convert/resize to webp; otherwise store original.
                        if (class_exists(\Intervention\Image\Laravel\Facades\Image::class)) {
                            $filename = uniqid() . '.webp';
                            $path = 'products/' . $filename;

                            $image = \Intervention\Image\Laravel\Facades\Image::read($imageFile);
                            $image->cover(800, 800);

                            Storage::disk('public')->put($path, (string) $image->encodeByMediaType('image/webp', quality: 80));
                        } else {
                            $ext = strtolower($imageFile->getClientOriginalExtension() ?: 'jpg');
                            $filename = uniqid() . '.' . $ext;
                            $path = $imageFile->storeAs('products', $filename, 'public');
                        }

                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_path' => $path,
                            'is_primary' => $index === 0,
                        ]);
                    }
                }

                // Handle specifications
                if (!empty($validated['specifications'])) {
                    foreach ($validated['specifications'] as $spec) {
                        if (!empty($spec['selectedQuantities']) && is_array($spec['selectedQuantities'])) {
                            foreach ($spec['selectedQuantities'] as $value => $quantity) {
                                if ($quantity > 0) {
                                    ProductSpecificationValue::create([
                                        'product_id' => $product->id,
                                        'specification_id' => $spec['id'],
                                        'value' => $value,
                                        'quantity' => $quantity,
                                    ]);
                                }
                            }
                        } elseif (!empty($spec['value'])) {
                            ProductSpecificationValue::create([
                                'product_id' => $product->id,
                                'specification_id' => $spec['id'],
                                'value' => $spec['value'],
                            ]);
                        }
                    }
                }
            });
        } catch (\Throwable $e) {
            \Log::error('Product Store Failed', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }

        return redirect()->route('admin.products.index')->with('success', 'Produit créé avec succès.');
    }

    /**
     * Update a product
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'sub_category_id' => 'required|exists:sub_categories,id',
            'name' => 'required|array',
            'name.fr' => 'required|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'description' => 'required|array',
            'description.fr' => 'nullable|string',
            'description.ar' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'free_shipping' => 'nullable|boolean',
            'images.*' => 'nullable|image|max:2048',
            'specifications' => 'nullable|array',
            'specifications.*.id' => 'required|exists:specifications,id',
            'specifications.*.value' => 'nullable|string',
            'specifications.*.selectedQuantities' => 'nullable|array',
            'specifications.*.selectedQuantities.*' => 'nullable|integer|min:0',
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
                $selectedQuantities = $spec['selectedQuantities'] ?? null;
                $hasQuantities = is_array($selectedQuantities) && collect($selectedQuantities)->filter(fn ($qty) => (int) $qty > 0)->isNotEmpty();

                // IDs can arrive as strings from the frontend; normalize to int for strict comparisons.
                $normalizedSpecId = is_numeric($specId) ? (int) $specId : $specId;

                if ($specId && !in_array($normalizedSpecId, $allowedSpecIds, true)) {
                    $validator->errors()->add("specifications.$index.id", "La spécification sélectionnée n'appartient pas à la sous-catégorie.");
                    continue;
                }

                if ($specId) {
                    $mapKey = is_numeric($specId) ? (int) $specId : $specId;
                    if (($specMap[$mapKey]->required ?? false) && !$hasQuantities && ($value === null || $value === '')) {
                        $validator->errors()->add("specifications.$index.value", 'Cette spécification est obligatoire.');
                    }
                }
            }
        });

        $validated = $validator->validate();

        DB::transaction(function () use ($validated, $request, $product) {
            $product->update($validated);

            // Handle new images
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

            // Update specifications
            if (isset($validated['specifications'])) {
                $product->specificationValues()->delete();
                foreach ($validated['specifications'] as $spec) {
                    if (!empty($spec['selectedQuantities']) && is_array($spec['selectedQuantities'])) {
                        foreach ($spec['selectedQuantities'] as $value => $quantity) {
                            if ($quantity > 0) {
                                ProductSpecificationValue::create([
                                    'product_id' => $product->id,
                                    'specification_id' => $spec['id'],
                                    'value' => $value,
                                    'quantity' => $quantity,
                                ]);
                            }
                        }
                    } elseif (!empty($spec['value'])) {
                        ProductSpecificationValue::create([
                            'product_id' => $product->id,
                            'specification_id' => $spec['id'],
                            'value' => $spec['value'],
                        ]);
                    }
                }
            }
        });

        return back()->with('success', 'Produit mis à jour avec succès.');
    }

    /**
     * Delete a product
     */
    public function destroy(Product $product): RedirectResponse
    {
        DB::transaction(function () use ($product) {
            // Delete images from storage
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
