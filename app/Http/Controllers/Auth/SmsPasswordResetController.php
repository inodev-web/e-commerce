<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class SmsPasswordResetController extends Controller
{
    public function __construct(
        private readonly SmsService $smsService
    ) {}

    /**
     * Display the forgot password view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPasswordSms');
    }

    /**
     * Handle an incoming password reset link request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'exists:users,phone'],
        ]);

        $user = User::where('phone', $request->phone)->first();

        try {
            $this->smsService->sendOtp($user);
            session(['reset_phone' => $request->phone]);
            return redirect()->route('password.reset.sms.view');
        } catch (\Exception $e) {
            return back()->withErrors(['phone' => $e->getMessage()]);
        }
    }

    /**
     * Display the password reset view.
     */
    public function edit(): Response
    {
        if (!session('reset_phone')) {
            return redirect()->route('password.request.sms');
        }

        return Inertia::render('Auth/ResetPasswordSms', [
            'phone' => session('reset_phone'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'exists:users,phone'],
            'code' => ['required', 'string'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::where('phone', $request->phone)->first();

        if ($user->otp_code !== $request->code) {
             return back()->withErrors(['code' => 'Code OTP invalide.']);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'otp_code' => null,
            'phone_verified_at' => now(), // Re-verify just in case
        ])->save();

        session()->forget('reset_phone');

        return redirect()->route('login')->with('status', 'Votre mot de passe a été réinitialisé.');
    }
}
