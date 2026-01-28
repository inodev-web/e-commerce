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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('specifications', 'name')->where('sub_category_id', $request->sub_category_id),
            ],
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('specifications', 'name')
                    ->where('sub_category_id', $specification->sub_category_id)
                    ->ignore($specification->id),
            ],
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
