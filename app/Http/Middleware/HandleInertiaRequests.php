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
        return [
            ...parent::share($request),
            'locale' => app()->getLocale(),
            'available_locales' => config('app.available_locales', ['fr', 'ar']),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'first_name' => $request->user()->client?->first_name,
                    'last_name' => $request->user()->client?->last_name,
                    'full_name' => $request->user()->client ? ($request->user()->client->first_name . ' ' . $request->user()->client->last_name) : 'Utilisateur',
                    'phone' => $request->user()->phone,
                    'roles' => $request->user()->getRoleNames(), // Assurez-vous que Spatie est bien configuré
                    'status' => $request->user()->status,
                    // Eviter de charger tout l'objet client si pas nécessaire, mais utile pour l'avatar etc.
                ] : null,
            ],
        ];
    }
}
