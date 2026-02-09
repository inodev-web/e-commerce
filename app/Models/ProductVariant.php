<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'stock',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    // Relationships

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variantSpecifications(): BelongsToMany
    {
        return $this->belongsToMany(Specification::class, 'product_variant_specifications', 'product_variant_id', 'specification_id')
            ->withPivot('value')
            ->withTimestamps();
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    // Accessors

    public function getEffectivePriceAttribute(): float
    {
        return $this->price ?? $this->product->price;
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->effective_price, 2) . ' DA';
    }

    // Methods

    public function isAvailable(): bool
    {
        return $this->is_active && $this->stock > 0 && $this->product->isAvailable();
    }

    public function getSpecificationValue(int $specificationId): ?string
    {
        $pivot = $this->variantSpecifications()->where('specifications.id', $specificationId)->first();
        return $pivot?->pivot->value;
    }

    public function hasSpecificationValue(int $specificationId, string $value): bool
    {
        return $this->variantSpecifications()
            ->where('specifications.id', $specificationId)
            ->where('product_variant_specifications.value', $value)
            ->exists();
    }

    public function getSpecificationNames(): array
    {
        return $this->variantSpecifications->pluck('pivot.value', 'name')->toArray();
    }

    public function getSpecificationIdsAndValues(): array
    {
        return $this->variantSpecifications->pluck('pivot.value', 'id')->toArray();
    }
}