<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use App\Enums\PromoCodeType;
use App\Enums\PromoCodeUsage;

class PromoCodeController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.loyalty.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code',
            'type' => ['required', new Enum(PromoCodeType::class)],
            'discount_value' => 'required_unless:type,' . PromoCodeType::FREE_SHIPPING->value . '|nullable|numeric|min:0',
            'max_use' => 'nullable|integer|min:1',
            'expiry_date' => 'nullable|date|after:today',
            'is_active' => 'boolean',
        ]);

        // Default discount_value to 0 if FREE_SHIPPING
        if ($validated['type'] === PromoCodeType::FREE_SHIPPING->value) {
            $validated['discount_value'] = 0;
        }

        PromoCode::create($validated);

        return redirect()->back()->with('success', 'Code promo créé avec succès.');
    }

    public function update(Request $request, PromoCode $promoCode)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'type' => ['required', new Enum(PromoCodeType::class)],
            'discount_value' => 'required_unless:type,' . PromoCodeType::FREE_SHIPPING->value . '|nullable|numeric|min:0',
            'max_use' => 'nullable|integer|min:1',
            'expiry_date' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        if ($validated['type'] === PromoCodeType::FREE_SHIPPING->value) {
            $validated['discount_value'] = 0;
        }

        $promoCode->update($validated);

        return redirect()->back()->with('success', 'Code promo mis à jour.');
    }

    public function destroy(PromoCode $promoCode)
    {
        $promoCode->delete();
        return redirect()->back()->with('success', 'Code promo supprimé.');
    }

    public function toggle(PromoCode $promoCode)
    {
        $promoCode->update(['is_active' => !$promoCode->is_active]);
        
        $status = $promoCode->is_active ? 'activé' : 'désactivé';
        
        return back()->with('success', "Code {$status} avec succès.");
    }
}
