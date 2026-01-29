<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(
        private readonly SmsService $smsService,
        private readonly \App\Services\LocationService $locationService
    ) {}
    
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'wilayas' => $this->locationService->getActiveWilayas()
                ->map(fn($w) => ['id' => $w->id, 'name' => $w->name])
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        \Illuminate\Support\Facades\Log::info('Register request', $request->all());
        // Optimisation : Charger les IDs valides depuis le cache pour éviter des requêtes DB lentes (exists)
        $wilayaIds = \Illuminate\Support\Facades\Cache::rememberForever('wilaya_ids', function () {
            return \App\Models\Wilaya::pluck('id')->toArray();
        });

        // Pour les communes, on peut soit charger toutes, soit valider dynamiquement si on avait l'ID wilaya, 
        // mais ici on va simplifier en chargeant les IDs communes valides.
        // Attention: charger toutes les IDs communes peut être lourd (1541 entrées), mais c'est mieux que 25s de latence.
        $communeIds = \Illuminate\Support\Facades\Cache::rememberForever('commune_ids', function () {
            return \App\Models\Commune::pluck('id')->toArray();
        });

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'wilaya_id' => ['required', \Illuminate\Validation\Rule::in($wilayaIds)],
            'commune_id' => ['required', \Illuminate\Validation\Rule::in($communeIds)],
            'address' => 'nullable|string',
        ]);

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'client',
                'status' => 'active',
            ]);

            $user->assignRole('client');

            // TÂCHE 2 (Sans SMS) : Vérification automatique
            $user->forceFill([
                'phone_verified_at' => now(),
            ])->save();

            Client::create([
                'user_id' => $user->id,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'phone' => $user->phone,
                'wilaya_id' => $request->wilaya_id,
                'commune_id' => $request->commune_id,
                'address' => $request->address,
            ]);

            // $this->smsService->sendOtp($user);

            return $user;
        });

        // event(new Registered($user));

        Auth::guard('web')->login($user);

        return redirect(route('products.index', absolute: false));
    }
}
