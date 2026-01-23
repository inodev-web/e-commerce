<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'session_id',
    ];

    // Relationships

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // Methods

    public function calculateTotal(): float
    {
        return (float) $this->items()->get()->sum(function ($item) {
            return $item->price_snapshot * $item->quantity;
        });
    }

    public function getTotalItems(): int
    {
        return (int) $this->items()->sum('quantity');
    }
}
