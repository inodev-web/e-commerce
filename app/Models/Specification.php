<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Specification extends Model
{
    use HasFactory;

    protected $fillable = [
        'sub_category_id',
        'name',
        'required',
    ];

    protected function casts(): array
    {
        return [
            'required' => 'boolean',
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
}
