<?php

declare(strict_types=1);

namespace App\Enums;

enum PromoCodeType: string
{
    case PERCENT = 'PERCENT';
    case FIXED = 'FIXED';

    public function label(): string
    {
        return match ($this) {
            self::PERCENT => 'Pourcentage',
            self::FIXED => 'Montant Fixe',
        };
    }

    public function format(float $value): string
    {
        return match ($this) {
            self::PERCENT => $value . '%',
            self::FIXED => $value . ' DA',
        };
    }
}
