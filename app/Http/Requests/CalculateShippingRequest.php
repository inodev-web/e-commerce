<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\DeliveryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CalculateShippingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wilaya_id' => ['required', 'integer', 'exists:wilayas,id'],
            'delivery_type' => ['required', Rule::enum(DeliveryType::class)],
        ];
    }
}
