<?php

declare(strict_types=1);

namespace App\DTOs;

readonly class AddToCartDTO
{
    public function __construct(
        public int $productId,
        public int $quantity,
        public ?int $productVariantId = null,
        public ?array $specificationValues = null,
        public ?int $clientId = null,
        public ?string $sessionId = null,
    ) {}

    public static function fromRequest(array $data, ?int $clientId, string $sessionId): self
    {
        return new self(
            productId: (int) $data['product_id'],
            quantity: (int) $data['quantity'],
            productVariantId: isset($data['product_variant_id']) ? (int) $data['product_variant_id'] : null,
            specificationValues: $data['specification_values'] ?? null,
            clientId: $clientId,
            sessionId: $sessionId,
        );
    }
}
