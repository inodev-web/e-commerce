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
        $totalPointsDistributed = LoyaltyPoint::where('points', '>', 0)->sum('points');
        $totalPointsUsed = LoyaltyPoint::where('points', '<', 0)->sum('points') * -1;
        $activeClientsCount = Client::whereHas('loyaltyPoints')->count();
        $settings = LoyaltySetting::first();

        return Inertia::render('Admin/Loyalty', [
            'stats' => [
                'distributed' => $totalPointsDistributed,
                'used' => $totalPointsUsed,
                'clients' => $activeClientsCount,
            ],
            'settings' => $settings,
        ]);
    }

    public function manualAdjustment(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'points' => 'required|integer',
            'action' => 'required|in:add,subtract',
            'description' => 'required|string|max:255',
        ]);

        $user = User::where('email', $request->email)->first();
        $client = $user->client;

        if (!$client) {
            return back()->withErrors(['email' => 'Cet utilisateur n\'est pas un client enregistré.']);
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
}

