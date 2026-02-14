<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        private readonly \App\Services\LocationService $locationService
    ) {}

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'wilayas' => \App\Models\Wilaya::active()
                ->orderBy('name')
                ->get()
                ->map(fn($w) => ['id' => $w->id, 'name' => $w->name, 'name_ar' => $w->name_ar])
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Sync Spatie role if missing (Self-healing permissions)
        if (strtolower($user->role) === 'admin' && ! $user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        if (strtolower($user->role) === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->intended(route('products.index', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
