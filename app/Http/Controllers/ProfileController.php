<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\LoyaltyPoint;
use App\Models\Order;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        // Ensure the user always has a referral code
        if (!$user->referral_code) {
            $user->referral_code = strtoupper(Str::random(10));
            $user->saveQuietly();
        }

        // Load recent orders for the profile "Mes commandes" tab
        $orders = [];
        if ($client) {
            $orders = Order::where('client_id', $client->id)
                ->with('items.product.images')
                ->orderByDesc('created_at')
                ->paginate(10);
        }

        // Build referrals list
        $referrals = $user->referrals()
            ->with('client')
            ->get()
            ->map(function ($refUser) {
                return [
                    'id' => $refUser->id,
                    'name' => $refUser->client
                        ? ($refUser->client->first_name . ' ' . $refUser->client->last_name)
                        : 'Utilisateur',
                    'joined_at' => $refUser->created_at->format('d/m/Y'),
                ];
            });

        // Load loyalty points history
        $loyaltyHistory = [];
        if ($client) {
            $loyaltyHistory = LoyaltyPoint::where('client_id', $client->id)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get()
                ->map(function ($point) {
                    return [
                        'id' => $point->id,
                        'points' => $point->points,
                        'description' => $point->description,
                        'created_at' => $point->created_at->format('d/m/Y H:i'),
                    ];
                });
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'referral_code' => $user->referral_code,
            'referrals' => $referrals,
            'orders' => $orders,
            'loyaltyHistory' => $loyaltyHistory,
        ]);
    }

    /**
     * Display the user's referral info.
     */
    public function referral(Request $request): Response
    {
        return Inertia::render('Profile/Referral', [
            'referral_code' => $request->user()->referral_code,
            'referrals' => $request->user()->referrals()
                ->with('client') // Charge le nom du client
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->client ? ($user->client->first_name . ' ' . $user->client->last_name) : 'Utilisateur',
                        'joined_at' => $user->created_at->format('d/m/Y'),
                    ];
                }),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $oldPhone = $user->phone;
        
        $user->fill($request->validated());

        if ($user->isDirty('phone')) {
            $user->phone_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::guard('web')->logout();
        Auth::forgetUser();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
