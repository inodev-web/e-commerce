<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Category extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'active',
    ];

    public array $translatable = ['name'];

    protected function casts(): array
    {
        return [
            'name' => 'array',
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
