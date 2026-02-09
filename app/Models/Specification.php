<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

class Specification extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'sub_category_id',
        'name',
        'required',
        'values',
    ];

    public array $translatable = ['name'];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'required' => 'boolean',
            'values' => 'array',
        ];
    }

    // Relationships

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function productSpecificationValues(): HasMany
    {
        return $this->hasMany(ProductSpecificationValue::class);
    }

    // Scopes

    public function scopeRequired($query)
    {
        return $query->where('required', true);
    }

    // Methods

    public function hasPredefinedValues(): bool
    {
        return !empty($this->values) && is_array($this->values);
    }

    public function getPredefinedValues(): array
    {
        return $this->values ?? [];
    }

    public function isValueValid(string $value): bool
    {
        if (!$this->hasPredefinedValues()) {
            return true;
        }
        return in_array($value, $this->values, true);
    }
}
