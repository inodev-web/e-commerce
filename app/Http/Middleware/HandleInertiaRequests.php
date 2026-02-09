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
        
        if ($user && $user->client) {
            $points = app(\App\Services\LoyaltyService::class)->getBalance($user->client->id);
            \Log::info('HandleInertiaRequests - User points loaded', [
                'user_id' => $user->id,
                'client_id' => $user->client->id,
                'points' => $points,
            ]);
        } else {
            \Log::info('HandleInertiaRequests - No user or client', [
                'has_user' => !is_null($user),
                'has_client' => $user?->client ? true : false,
            ]);
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
                    'roles' => $user->getRoleNames(),
                    'status' => $user->status,
                    'points' => $points,
                ] : null,
            ],
            'cartCount' => fn () => $user?->client?->cart?->items->sum('quantity') ?? 0,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'order' => session('order'),
        ];
    }
}
