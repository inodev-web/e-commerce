<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PixelSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'pixel_id',
        'name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // Methods

    public static function getActiveGrouped(): array
    {
        return static::where('is_active', true)
            ->get()
            ->groupBy('platform')
            ->map(function ($pixels) {
                return $pixels->pluck('pixel_id')->toArray();
            })
            ->toArray();
    }
}
