<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'first_name',
        'last_name',
        'phone',
        'address',
        'wilaya_name',
        'commune_name',
        'delivery_type',
        'delivery_price',
        'products_total',
        'discount_total',
        'total_price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'delivery_type' => DeliveryType::class,
            'delivery_price' => 'decimal:2',
            'products_total' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'total_price' => 'decimal:2',
            'status' => OrderStatus::class,
        ];
    }

    // Relationships

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes

    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::PENDING);
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', OrderStatus::PROCESSING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', OrderStatus::DELIVERED);
    }

    // Accessors

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getFullAddressAttribute(): string
    {
        return "{$this->address}, {$this->commune_name}, {$this->wilaya_name}";
    }
}
