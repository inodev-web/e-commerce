<?php

declare(strict_types=1);

namespace App\Enums;

enum DeliveryType: string
{
    case DOMICILE = 'DOMICILE';
    case BUREAU = 'BUREAU';

    public function label(): string
    {
        return match ($this) {
            self::DOMICILE => 'Domicile',
            self::BUREAU => 'Bureau',
        };
    }
}
