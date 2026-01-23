<?php

declare(strict_types=1);

namespace App\DTOs;

readonly class AddToCartDTO
{
    public function __construct(
        public int $productId,
        public int $quantity,
        public ?int $clientId = null,
        public ?string $sessionId = null,
    ) {}

    public static function fromRequest(array $data, ?int $clientId, string $sessionId): self
    {
        return new self(
            productId: (int) $data['product_id'],
            quantity: (int) $data['quantity'],
            clientId: $clientId,
            sessionId: $sessionId,
        );
    }
}
