<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Enums\DeliveryType;

readonly class CreateOrderDTO
{
    public function __construct(
        public ?int $clientId,
        public array $items, // ['product_id' => ['quantity' => int]]
        public string $firstName,
        public string $lastName,
        public string $phone,
        public string $address,
        public int $wilayaId,
        public int $communeId,
        public DeliveryType $deliveryType,
        public ?string $promoCode = null,
        public int $loyaltyPointsUsed = 0,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            clientId: $data['client_id'] ?? null,
            items: $data['items'],
            firstName: $data['first_name'],
            lastName: $data['last_name'],
            phone: $data['phone'],
            address: $data['address'],
            wilayaId: (int) $data['wilaya_id'],
            communeId: (int) $data['commune_id'],
            deliveryType: DeliveryType::from($data['delivery_type']),
            promoCode: $data['promo_code'] ?? null,
            loyaltyPointsUsed: (int) ($data['use_loyalty_points'] ?? 0),
        );
    }
}
