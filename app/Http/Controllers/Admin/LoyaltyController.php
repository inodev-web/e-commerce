<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltySetting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoyaltyController extends Controller
{
    public function index()
    {
        $settings = LoyaltySetting::first();
        $conversionRate = $settings?->points_conversion_rate ?? 1.00;

        // 1. Loyalty Debt (Total positive points * conversion rate)
        $totalPointsInput = LoyaltyPoint::where('points', '>', 0)->sum('points') ?? 0;
        $totalPointsUsed = LoyaltyPoint::where('points', '<', 0)->sum('points') * -1;
        $activeClientsCount = Client::whereHas('loyaltyPoints')->count();
        
        $loyaltyDebt = $totalPointsInput * $conversionRate;

        // 2. Referral Performance
        $totalReferrals = \App\Models\Order::whereNotNull('referrer_id')->count();

        // 3. Promo Impact
        $promoImpact = \App\Models\Order::where('discount_total', '>', 0)
            ->orWhere('is_free_shipping', true)
            ->sum('total_price') ?? 0;

        // 4. Promo Codes
        $promoCodes = \App\Models\PromoCode::latest()->paginate(10);

        return Inertia::render('Admin/Loyalty', [
            'stats' => [
                'distributed' => $totalPointsInput,
                'used' => $totalPointsUsed,
                'clients' => $activeClientsCount,
                'debt' => round((float) $loyaltyDebt, 2),
                'referrals' => (int) $totalReferrals,
                'promo_impact' => round((float) $promoImpact, 2),
            ],
            'settings' => $settings,
            'promoCodes' => $promoCodes,
        ]);
    }

    public function manualAdjustment(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|exists:users,phone',
            'points' => 'required|integer',
            'action' => 'required|in:add,subtract',
            'description' => 'required|string|max:255',
        ]);

        $user = User::where('phone', $request->phone)->first();
        $client = $user->client;

        if (!$client) {
            return back()->withErrors(['phone' => 'Cet utilisateur n\'est pas un client enregistré.']);
        }

        $points = (int) $request->points;
        if ($request->action === 'subtract') {
            $points = -$points;
            // Check balance?
            $currentBalance = $client->loyaltyPoints()->sum('points');
            if ($currentBalance + $points < 0) {
                 return back()->withErrors(['points' => 'Solde insuffisant pour ce retrait. Solde actuel: ' . $currentBalance]);
            }
        }

        LoyaltyPoint::create([
            'client_id' => $client->id,
            'points' => $points,
            'description' => $request->description . ' (Admin Adjustment)',
        ]);

        return back()->with('success', 'Ajustement des points effectué avec succès.');
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'referral_discount_amount' => 'required|numeric|min:0',
            'referral_reward_points' => 'required|integer|min:0',
            'points_conversion_rate' => 'required|numeric|min:0.01|max:1000',
        ]);

        $settings = LoyaltySetting::first();
        if ($settings) {
            $settings->update($validated);
        } else {
            LoyaltySetting::create($validated);
        }

        return back()->with('success', 'Paramètres de fidélité mis à jour.');
    }

    public function clientHistory(Client $client)
    {
        return response()->json([
            'history' => $client->loyaltyPoints()->latest()->get(),
            'balance' => $client->loyaltyPoints()->sum('points')
        ]);
    }

    /**
     * Get loyalty program statistics for dashboard
     */
    public function getStats()
    {
        $setting = LoyaltySetting::first();
        $conversionRate = $setting?->points_conversion_rate ?? 1.00;
        
        // 1. Loyalty Debt (Total positive points * conversion rate)
        $totalPoints = LoyaltyPoint::where('points', '>', 0)->sum('points') ?? 0;
        $loyaltyDebt = $totalPoints * $conversionRate;

        // 2. Referral Performance (Total completed referrals)
        $totalReferrals = \App\Models\Order::whereNotNull('referrer_id')
            ->whereNotNull('referral_code')
            ->count();

        // 3. Promo Impact (Total revenue from orders with discounts)
        $promoImpact = \App\Models\Order::where('discount_total', '>', 0)
            ->orWhere('is_free_shipping', true)
            ->sum('total_price') ?? 0;

        $activePromoCodes = \App\Models\PromoCode::where('is_active', true)->count();

        return response()->json([
            'loyalty_debt' => round((float) $loyaltyDebt, 2),
            'total_referrals' => (int) $totalReferrals,
            'promo_impact' => round((float) $promoImpact, 2),
            'active_promo_codes' => (int) $activePromoCodes,
        ]);
    }
}

