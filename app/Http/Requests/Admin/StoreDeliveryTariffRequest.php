<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\DeliveryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDeliveryTariffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'wilaya_id' => ['required', 'integer', 'exists:wilayas,id'],
            'type' => ['required', Rule::enum(DeliveryType::class)],
            'price' => ['required', 'numeric', 'min:0', 'max:10000'],
            'is_active' => ['boolean'],
        ];
    }
}
