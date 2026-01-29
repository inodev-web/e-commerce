<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class Product extends Model
{
    use HasFactory, SoftDeletes, HasTranslations;

    protected $fillable = [
        'sub_category_id',
        'name',
        'description',
        'price',
        'stock',
        'status',
        'free_shipping',
    ];

    public array $translatable = ['name', 'description'];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'price' => 'decimal:2',
            'stock' => 'integer',
            'status' => ProductStatus::class,
            'free_shipping' => 'boolean',
        ];
    }

    // Relationships

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }

    public function specificationValues(): HasMany
    {
        return $this->hasMany(ProductSpecificationValue::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('is_primary', 'desc');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('status', ProductStatus::ACTIF);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    // Accessors

    public function getPrimaryImageAttribute(): ?ProductImage
    {
        return $this->images()->where('is_primary', true)->first() 
            ?? $this->images()->first();
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format((float) $this->price, 2) . ' DA';
    }

    // Methods

    public function isAvailable(): bool
    {
        return $this->status === ProductStatus::ACTIF && $this->stock > 0;
    }

    public function decrementStock(int $quantity): bool
    {
        if ($this->stock < $quantity) {
            return false;
        }

        $this->decrement('stock', $quantity);
        
        if ($this->stock === 0) {
            $this->update(['status' => ProductStatus::HORS_STOCK]);
        }
        
        return true;
    }

    public function incrementStock(int $quantity): void
    {
        $this->increment('stock', $quantity);
        
        if ($this->stock > 0 && $this->status === ProductStatus::HORS_STOCK) {
            $this->update(['status' => ProductStatus::ACTIF]);
        }
    }
}
