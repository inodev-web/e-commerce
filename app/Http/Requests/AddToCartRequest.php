<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Le produit est requis',
            'product_id.exists' => 'Le produit n\'existe pas',
            'quantity.required' => 'La quantité est requise',
            'quantity.min' => 'La quantité minimum est 1',
            'quantity.max' => 'La quantité maximum est 100',
        ];
    }
}
