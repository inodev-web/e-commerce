<?php

declare(strict_types=1);

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'PENDING';
    case PROCESSING = 'PROCESSING';
    case CONFIRMED = 'CONFIRMED';
    case SHIPPED = 'SHIPPED';
    case DELIVERED = 'DELIVERED';
    case CANCELLED = 'CANCELLED';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'En Attente',
            self::PROCESSING => 'En Traitement',
            self::CONFIRMED => 'Confirmée',
            self::SHIPPED => 'Expédiée',
            self::DELIVERED => 'Livrée',
            self::CANCELLED => 'Annulée',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::PROCESSING => 'yellow',
            self::CONFIRMED => 'blue',
            self::SHIPPED => 'purple',
            self::DELIVERED => 'green',
            self::CANCELLED => 'red',
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return match ($this) {
            self::PENDING => in_array($status, [self::PROCESSING, self::CONFIRMED, self::DELIVERED, self::CANCELLED], true),
            self::PROCESSING => in_array($status, [self::CONFIRMED, self::CANCELLED, self::DELIVERED], true),
            self::CONFIRMED => in_array($status, [self::SHIPPED, self::CANCELLED, self::DELIVERED], true),
            self::SHIPPED => in_array($status, [self::DELIVERED], true),
            self::DELIVERED => false,
            self::CANCELLED => in_array($status, [self::PENDING], true),
        };
    }
}
