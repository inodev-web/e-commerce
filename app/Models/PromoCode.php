<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PromoCodeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'discount_value',
        'max_use',
        'expiry_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => PromoCodeType::class,
            'discount_value' => 'decimal:2',
            'max_use' => 'integer',
            'expiry_date' => 'date',
            'is_active' => 'boolean',
        ];
    }



    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            });
    }

    // Methods

    public function isValid(?int $clientId = null): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expiry_date && $this->expiry_date->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount and determine if shipping is free
     * 
     * @return array{discount: float, free_shipping: bool}
     */
    public function calculateDiscount(float $amount, float $deliveryPrice = 0): array
    {
        return match ($this->type) {
            PromoCodeType::PERCENT => [
                'discount' => $amount * ((float) $this->discount_value / 100),
                'free_shipping' => false,
            ],
            PromoCodeType::FIXED => [
                'discount' => min((float) $this->discount_value, $amount),
                'free_shipping' => false,
            ],
            PromoCodeType::FREE_SHIPPING => [
                'discount' => 0,
                'free_shipping' => true,
            ],
        };
    }
}
