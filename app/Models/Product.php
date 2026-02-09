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

    public function specifications()
    {
        return $this->belongsToMany(Specification::class, 'product_specification_values')
            ->withPivot('value');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('is_main', 'desc');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('status', ProductStatus::ACTIF);
    }

    public function scopeInStock($query)
    {
        return $query->whereHas('variants', function ($q) {
            $q->where('stock', '>', 0)->where('is_active', true);
        });
    }

    // Accessors

    public function getPrimaryImageAttribute(): ?ProductImage
    {
        return $this->images()->where('is_main', true)->first() 
            ?? $this->images()->first();
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format((float) $this->price, 2) . ' DA';
    }

    // Methods

    public function isAvailable(): bool
    {
        if ($this->status !== ProductStatus::ACTIF) {
            return false;
        }
        
        // If product has variants, check if any variant is active and in stock
        if ($this->hasVariants()) {
            return $this->variants()->active()->inStock()->exists();
        }
        
        // If product has no variants, check direct stock
        return $this->stock > 0;
    }

    public function getTotalStockAttribute(): int
    {
        return $this->variants()->active()->sum('stock');
    }

    public function hasVariants(): bool
    {
        return $this->variants()->exists();
    }

    public function getLowestPriceAttribute(): float
    {
        $minVariantPrice = $this->variants()->active()->min('price');
        return $minVariantPrice ? min($minVariantPrice, $this->price) : $this->price;
    }

    public function getHighestPriceAttribute(): float
    {
        $maxVariantPrice = $this->variants()->active()->max('price');
        return $maxVariantPrice ? max($maxVariantPrice, $this->price) : $this->price;
    }

    public function getPriceRangeAttribute(): string
    {
        if (!$this->hasVariants()) {
            return $this->formatted_price;
        }

        $lowest = number_format($this->lowest_price, 2) . ' DA';
        $highest = number_format($this->highest_price, 2) . ' DA';
        
        return $lowest === $highest ? $lowest : $lowest . ' - ' . $highest;
    }

    public function decrementStock(int $quantity, ?int $variantId = null): bool
    {
        if ($variantId) {
            $variant = $this->variants()->findOrFail($variantId);
            if ($variant->stock < $quantity) {
                return false;
            }
            $variant->decrement('stock', $quantity);
            return true;
        }

        if ($this->total_stock < $quantity) {
            return false;
        }

        $this->variants()->active()->inStock()->get()->each(function ($variant) use (&$quantity) {
            if ($quantity <= 0) return false;
            $deduct = min($variant->stock, $quantity);
            $variant->decrement('stock', $deduct);
            $quantity -= $deduct;
            return $quantity > 0;
        });

        return true;
    }

    public function incrementStock(int $quantity, ?int $variantId = null): void
    {
        if ($variantId) {
            $variant = $this->variants()->findOrFail($variantId);
            $variant->increment('stock', $quantity);
        } else {
            $this->variants()->active()->get()->each(function ($variant) use ($quantity) {
                $variant->increment('stock', $quantity);
            });
        }
    }
}
