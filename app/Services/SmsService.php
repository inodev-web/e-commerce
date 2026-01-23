<?php

namespace App\Services;

use App\Contracts\SmsProviderInterface;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Exception;

class SmsService
{
    public function __construct(
        protected SmsProviderInterface $smsProvider
    ) {}

    public function sendOtp(User $user): void
    {
        $this->ensureNotRateLimited($user);

        $otp = $this->generateOtp();
        
        $user->forceFill([
            'otp_code' => $otp,
        ])->save();

        $this->smsProvider->send(
            $user->phone,
            "Votre code de vérification est : {$otp}"
        );

        $this->hitRateLimiter($user);
    }

    protected function generateOtp(): string
    {
        // Generate a random 6-digit number
        return (string) random_int(100000, 999999);
    }

    protected function ensureNotRateLimited(User $user): void
    {
        $key = 'sms_otp_rate_limit:' . $user->id;
        
        if (Cache::has($key)) {
            throw new Exception("Veuillez attendre 2 minutes avant de renvoyer un SMS.");
        }
    }

    protected function hitRateLimiter(User $user): void
    {
        $key = 'sms_otp_rate_limit:' . $user->id;
        // Expires in 2 minutes (120 seconds)
        Cache::put($key, true, 120);
    }

    public function verifyOtp(User $user, string $code): bool
    {
        if ($user->otp_code === $code) {
            $user->forceFill([
                'phone_verified_at' => now(),
                'otp_code' => null,
            ])->save();
            
            return true;
        }

        return false;
    }
}
