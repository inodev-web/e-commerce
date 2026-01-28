<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'url',
        'image_path',
        'is_primary',
    ];

    protected $appends = [
        'image_path',
    ];

    protected $hidden = [
        'url',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    // Relationships

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors & Mutators

    public function getImagePathAttribute(): ?string
    {
        return $this->url;
    }

    public function setImagePathAttribute(?string $value): void
    {
        $this->attributes['url'] = $value;
    }
}
