<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price_snapshot',
        'metadata_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price_snapshot' => 'decimal:2',
            'metadata_snapshot' => 'array', // JSONB column
        ];
    }

    // Relationships

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors

    public function getSubtotalAttribute(): float
    {
        return (float) $this->price_snapshot * $this->quantity;
    }

    public function getProductNameAttribute(): ?string
    {
        return $this->metadata_snapshot['name'] ?? null;
    }

    public function getSpecificationsAttribute(): array
    {
        return $this->metadata_snapshot['specifications'] ?? [];
    }
}
