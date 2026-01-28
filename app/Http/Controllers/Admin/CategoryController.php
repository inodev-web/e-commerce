<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'name' => 'required|string|max:255|unique:categories,name',
            'active' => 'boolean',
        ]);

        Category::create($validated);

        return back()->with('success', 'Catégorie créée avec succès.');
    }

    /**
     * Mettre à jour une catégorie
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'active' => 'boolean',
        ]);

        $category->update($validated);

        return back()->with('success', 'Catégorie mise à jour avec succès.');
    }

    /**
     * Supprimer une catégorie
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->subCategories()->count() > 0) {
            return back()->with('error', 'Impossible de supprimer une catégorie contenant des sous-catégories.');
        }

        $category->delete();

        return back()->with('success', 'Catégorie supprimée avec succès.');
    }

    /**
     * Ajouter une sous-catégorie
     */
    public function storeSubCategory(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
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
            'name' => 'required|string|max:255|unique:sub_categories,name,' . $subCategory->id . ',id,category_id,' . $subCategory->category_id,
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
        if ($subCategory->products()->count() > 0) {
            return back()->with('error', 'Impossible de supprimer une sous-catégorie contenant des produits.');
        }

        $subCategory->delete();

        return back()->with('success', 'Sous-catégorie supprimée avec succès.');
    }
}
