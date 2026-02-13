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

    protected function prepareForValidation(): void
    {
        // ⚡️ COMPATIBILITÉ : Si la requête vient de la page produit (structure plate)
        // on la transforme en structure standard 'items' pour la validation
        if ($this->has('product_id') && !$this->has('items')) {
            $this->merge([
                'items' => [
                    $this->product_id => [
                        'quantity' => $this->quantity ?? 1,
                        'specification_values' => $this->specification_values ?? [],
                    ]
                ]
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'address' => ['nullable', 'string'],
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
            'items' => ['required_without:cart_id', 'array'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.specification_values' => ['nullable', 'array'],
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
