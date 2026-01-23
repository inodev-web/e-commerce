<?php

declare(strict_types=1);

namespace App\Enums;

enum ProductStatus: string
{
    case ACTIF = 'ACTIF';
    case HORS_STOCK = 'HORS_STOCK';

    public function label(): string
    {
        return match ($this) {
            self::ACTIF => 'Actif',
            self::HORS_STOCK => 'Hors Stock',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::ACTIF => 'green',
            self::HORS_STOCK => 'red',
        };
    }

    public function isAvailable(): bool
    {
        return $this === self::ACTIF;
    }
}
