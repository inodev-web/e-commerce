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
        private readonly SmsService $smsService
    ) {}
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        \Illuminate\Support\Facades\Log::info('Register request', $request->all());
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
            ]);

            Client::create([
                'user_id' => $user->id,
                'phone' => $user->phone,
                // Les autres champs seront remplis plus tard dans le profil
            ]);

            $this->smsService->sendOtp($user);

            return $user;
        });

        event(new Registered($user));

        Auth::guard('web')->login($user);

        return redirect(route('products.index', absolute: false));
    }
}
