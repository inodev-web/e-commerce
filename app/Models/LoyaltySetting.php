<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'referral_discount_amount',
        'referral_reward_points',
        'points_conversion_rate',
    ];

    protected function casts(): array
    {
        return [
            'referral_discount_amount' => 'decimal:2',
            'referral_reward_points' => 'integer',
            'points_conversion_rate' => 'decimal:2',
        ];
    }
}
