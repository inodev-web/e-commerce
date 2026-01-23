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
        'usage_type',
        'client_id',
        'discount_value',
        'max_use',
        'expiry_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => PromoCodeType::class,
            'usage_type' => \App\Enums\PromoCodeUsage::class,
            'discount_value' => 'decimal:2',
            'max_use' => 'integer',
            'expiry_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    // Relationships

    public function client()
    {
        return $this->belongsTo(Client::class);
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

        if ($this->usage_type === \App\Enums\PromoCodeUsage::PERSONAL) {
            if (!$clientId || $this->client_id !== $clientId) {
                return false;
            }
        }

        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        return match ($this->type) {
            PromoCodeType::PERCENT => $amount * ((float) $this->discount_value / 100),
            PromoCodeType::FIXED => min((float) $this->discount_value, $amount),
        };
    }
}
