<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpecificationController extends Controller
{
    /**
     * Enregistrer une nouvelle spécification
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sub_category_id' => ['required', 'exists:sub_categories,id'],
            'name' => 'required|array',
            'name.fr' => 'required|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'required' => 'boolean',
        ]);

        Specification::create($validated);

        return back()->with('success', 'Spécification créée avec succès.');
    }

    /**
     * Mettre à jour une spécification
     */
    public function update(Request $request, Specification $specification): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.fr' => 'required|string|max:255',
            'name.ar' => 'nullable|string|max:255',
            'required' => 'boolean',
        ]);

        $specification->update($validated);

        return back()->with('success', 'Spécification mise à jour avec succès.');
    }

    /**
     * Supprimer une spécification
     */
    public function destroy(Specification $specification): RedirectResponse
    {
        $specification->delete();

        return back()->with('success', 'Spécification supprimée avec succès.');
    }
}
