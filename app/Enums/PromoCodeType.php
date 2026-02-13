<?php

declare(strict_types=1);

namespace App\Enums;

enum PromoCodeType: string
{
    case PERCENT = 'PERCENT';
    case FIXED = 'FIXED';
    case FREE_SHIPPING = 'FREE_SHIPPING';

    public function label(): string
    {
        return match ($this) {
            self::PERCENT => 'Pourcentage',
            self::FIXED => 'Montant Fixe',
            self::FREE_SHIPPING => 'Livraison Gratuite',
        };
    }

    public function format(float $value): string
    {
        return match ($this) {
            self::PERCENT => $value . '%',
            self::FIXED => $value . ' DA',
            self::FREE_SHIPPING => 'Gratuit',
        };
    }
}
