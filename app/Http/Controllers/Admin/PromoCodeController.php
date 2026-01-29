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
        $promoCodes = PromoCode::latest()->paginate(10);
        return Inertia::render('Admin/Promotions', [
            'promoCodes' => $promoCodes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code',
            'type' => ['required', new Enum(PromoCodeType::class)],
            'usage_type' => ['required', new Enum(PromoCodeUsage::class)],
            'discount_value' => 'required|numeric|min:0',
            'max_use' => 'nullable|integer|min:1',
            'expiry_date' => 'nullable|date|after:today',
            'is_active' => 'boolean',
            'client_id' => 'nullable|exists:clients,id|required_if:usage_type,' . PromoCodeUsage::PERSONAL->value,
        ]);

        PromoCode::create($validated);

        return redirect()->back()->with('success', 'Code promo créé avec succès.');
    }

    public function update(Request $request, PromoCode $promoCode)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'type' => ['required', new Enum(PromoCodeType::class)],
            'usage_type' => ['required', new Enum(PromoCodeUsage::class)],
            'discount_value' => 'required|numeric|min:0',
            'max_use' => 'nullable|integer|min:1',
            'expiry_date' => 'nullable|date',
            'is_active' => 'boolean',
            'client_id' => 'nullable|exists:clients,id|required_if:usage_type,' . PromoCodeUsage::PERSONAL->value,
        ]);

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
        return redirect()->back()->with('success', 'Statut modifié.');
    }
}
