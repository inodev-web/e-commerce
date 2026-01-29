<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $hasSubCategories = $category->subCategories()->count() > 0;
        $hasProducts = \App\Models\Product::withTrashed()
            ->whereHas('subCategory', fn ($q) => $q->where('category_id', $category->id))
            ->exists();

        if ($hasSubCategories || $hasProducts) {
            return back()->with('error', 'Impossible de supprimer une catégorie contenant des sous-catégories.');
        }

        $category->delete();
        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        return back()->with('success', 'Catégorie supprimée avec succès.');
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
        if ($subCategory->products()->withTrashed()->count() > 0) {
            return back()->with('error', 'Impossible de supprimer une sous-catégorie contenant des produits.');
        }

        $subCategory->delete();

        return back()->with('success', 'Sous-catégorie supprimée avec succès.');
    }
}
