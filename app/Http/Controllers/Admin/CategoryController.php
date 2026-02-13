<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Lister les catégories
     */
    public function index(): Response
    {
        $categories = Category::with('subCategories')->get();
        return Inertia::render('Admin/Categories', [
            'categories' => $categories
        ]);
    }

    /**
     * Enregistrer une nouvelle catégorie
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required',
            'name.fr' => 'nullable|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'active' => 'boolean',
            'image' => 'nullable|image|max:4096',
        ]);

        $name = is_array($validated['name'] ?? null)
            ? $validated['name']
            : ['fr' => (string) ($validated['name'] ?? ''), 'ar' => ''];

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        Category::create([
            'name' => $name,
            'active' => $validated['active'] ?? true,
            'image_path' => $imagePath,
        ]);

        return back()->with('success', 'Catégorie créée avec succès.');
    }

    /**
     * Mettre à jour une catégorie
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required',
            'name.fr' => 'nullable|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'active' => 'boolean',
            'image' => 'nullable|image|max:4096',
        ]);

        $name = is_array($validated['name'] ?? null)
            ? $validated['name']
            : ['fr' => (string) ($validated['name'] ?? ''), 'ar' => ''];

        $imagePath = $category->image_path;
        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        $category->update([
            'name' => $name,
            'active' => $validated['active'] ?? $category->active,
            'image_path' => $imagePath,
        ]);

        return back()->with('success', 'Catégorie mise à jour avec succès.');
    }

    /**
     * Supprimer une catégorie
     */
    public function destroy(Category $category): RedirectResponse
    {
        DB::transaction(function () use ($category) {
            // Delete all products related to this category through subcategories
            $subCategoryIds = $category->subCategories()->pluck('id');
            
            // Get impacted product IDs to clear related items
            $productIds = \App\Models\Product::withTrashed()->whereIn('sub_category_id', $subCategoryIds)->pluck('id');
            
            // Delete related items that block force deletion (restricted FKs)
            \App\Models\CartItem::whereIn('product_id', $productIds)->delete();
            \App\Models\OrderItem::whereIn('product_id', $productIds)->delete();

            // Force delete products to satisfy foreign key constraints
            // (since SubCategory is hard-deleted and products still reference it post-soft-delete)
            \App\Models\Product::withTrashed()->whereIn('sub_category_id', $subCategoryIds)->forceDelete();
            
            // Delete subcategories
            $category->subCategories()->delete();

            // Delete category image
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }

            $category->delete();
        });

        return back()->with('success', 'Catégorie et tout son contenu supprimés avec succès.');
    }

    /**
     * Ajouter une sous-catégorie
     */
    public function storeSubCategory(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.fr' => 'required|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        $category->subCategories()->create($validated);

        return back()->with('success', 'Sous-catégorie ajoutée avec succès.');
    }

    /**
     * Mettre à jour une sous-catégorie
     */
    public function updateSubCategory(Request $request, SubCategory $subCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.fr' => 'required|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        $subCategory->update($validated);

        return back()->with('success', 'Sous-catégorie mise à jour avec succès.');
    }

    /**
     * Supprimer une sous-catégorie
     */
    public function destroySubCategory(SubCategory $subCategory): RedirectResponse
    {
        DB::transaction(function () use ($subCategory) {
            $productIds = $subCategory->products()->withTrashed()->pluck('id');

            // Delete related items that block deletion (restricted FKs)
            \App\Models\CartItem::whereIn('product_id', $productIds)->delete();
            \App\Models\OrderItem::whereIn('product_id', $productIds)->delete();

            // Force delete products to satisfy foreign key constraints
            $subCategory->products()->withTrashed()->forceDelete();
            
            // Delete subcategory
            $subCategory->delete();
        });

        return back()->with('success', 'Sous-catégorie et ses produits supprimés avec succès.');
    }
}
