<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $points = 0;
        $loyaltySetting = app(\App\Models\LoyaltySetting::class)->first();
        $conversionRate = $loyaltySetting ? (float)$loyaltySetting->points_conversion_rate : 1.0;
        
        if ($user && $user->client) {
            $points = app(\App\Services\LoyaltyService::class)->getBalance($user->client->id);
        }
        
        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'available_locales' => config('app.available_locales', ['fr', 'ar']),
            'auth' => fn () => [
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->client?->first_name,
                    'last_name' => $user->client?->last_name,
                    'full_name' => $user->client ? ($user->client->first_name . ' ' . $user->client->last_name) : 'Utilisateur',
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'roles' => $user->getRoleNames(),
                    'status' => $user->status,
                    'points' => $points,
                    'loyalty_conversion_rate' => $conversionRate,
                    'client' => $user->client ? [
                        'id' => $user->client->id,
                        'first_name' => $user->client->first_name,
                        'last_name' => $user->client->last_name,
                        'phone' => $user->client->phone,
                        'address' => $user->client->address,
                        'wilaya_id' => $user->client->wilaya_id,
                        'commune_id' => $user->client->commune_id,
                    ] : null,
                ] : null,
            ],
            'cartCount' => fn () => $user?->client?->cart?->items->sum('quantity') ?? 0,
            'pixels' => function () {
                return \App\Models\PixelSetting::getActiveGrouped();
            },
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'order' => session('order'),
        ];
    }
}
