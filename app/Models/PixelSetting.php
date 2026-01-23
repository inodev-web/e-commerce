<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PixelSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'meta_pixel_id',
        'google_pixel_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // Methods

    public static function getActive(): ?self
    {
        return static::where('is_active', true)->first();
    }
}
