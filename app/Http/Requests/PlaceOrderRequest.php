<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\DeliveryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'address' => ['required', 'string'],
            'wilaya_id' => ['required', 'integer', 'exists:wilayas,id'],
            'commune_id' => ['required', 'integer', 'exists:communes,id'],
            'delivery_type' => ['required', Rule::enum(DeliveryType::class)],
            'promo_code' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if (!$value) {
                        return;
                    }

                    $code = strtoupper(trim((string) $value));
                    $promoExists = \App\Models\PromoCode::where('code', $code)->exists();
                    $referralExists = \App\Models\User::where('referral_code', $code)->exists();

                    if (!$promoExists && !$referralExists) {
                        $fail('Le code promo est invalide.');
                    }
                },
            ],
            'use_loyalty_points' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Le numéro de téléphone doit commencer par 05, 06 ou 07 et contenir 10 chiffres',
            'wilaya_id.exists' => 'La wilaya sélectionnée n\'existe pas',
            'commune_id.exists' => 'La commune sélectionnée n\'existe pas',
        ];
    }
}
