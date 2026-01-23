<?php

declare(strict_types=1);

namespace App\Enums;

enum PromoCodeUsage: string
{
    case PERSONAL = 'PERSONAL';
    case SHAREABLE = 'SHAREABLE';

    public function label(): string
    {
        return match ($this) {
            self::PERSONAL => 'Personnel',
            self::SHAREABLE => 'Partageable',
        };
    }
}
