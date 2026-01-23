<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    // Relationships

    public function subCategories(): HasMany
    {
        return $this->hasMany(SubCategory::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
