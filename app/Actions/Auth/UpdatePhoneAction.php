<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Models\User;
use App\Services\SmsService;
use Illuminate\Support\Facades\DB;

class UpdatePhoneAction
{
    public function __construct(
        private readonly SmsService $smsService
    ) {}

    /**
     * Mettre à jour le numéro de téléphone et déclencher une vérification OTP
     */
    public function execute(User $user, string $newPhone): void
    {
        DB::transaction(function () use ($user, $newPhone) {
            $user->update([
                'phone' => $newPhone,
                'phone_verified_at' => null, // Réinitialiser la vérification
            ]);

            // Synchroniser avec le modèle Client si présent
            if ($user->client) {
                $user->client->update(['phone' => $newPhone]);
            }

            // Envoyer le nouvel OTP
            $this->smsService->sendOtp($user);
        });
    }
}
