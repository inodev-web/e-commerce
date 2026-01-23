<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\DeliveryType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryTariff extends Model
{
    use HasFactory;

    protected $fillable = [
        'wilaya_id',
        'type',
        'price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'type' => DeliveryType::class,
            'is_active' => 'boolean',
        ];
    }

    // Relationships

    public function wilaya(): BelongsTo
    {
        return $this->belongsTo(Wilaya::class);
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForWilaya($query, int $wilayaId)
    {
        return $query->where('wilaya_id', $wilayaId);
    }

    public function scopeForType($query, DeliveryType $type)
    {
        return $query->where('type', $type);
    }
}
