<?php

declare(strict_types=1);

namespace App\DTOs;

use App\Enums\ProductStatus;

readonly class ProductFilterDTO
{
    public function __construct(
        public ?int $categoryId = null,
        public ?int $subCategoryId = null,
        public ?ProductStatus $status = null,
        public ?float $minPrice = null,
        public ?float $maxPrice = null,
        public ?string $search = null,
        public bool $inStockOnly = false,
        public string $sortBy = 'created_at',
        public string $sortDirection = 'desc',
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            subCategoryId: isset($data['sub_category_id']) ? (int) $data['sub_category_id'] : null,
            status: isset($data['status']) ? ProductStatus::from($data['status']) : null,
            minPrice: isset($data['min_price']) ? (float) $data['min_price'] : null,
            maxPrice: isset($data['max_price']) ? (float) $data['max_price'] : null,
            search: $data['search'] ?? null,
            inStockOnly: (bool) ($data['in_stock_only'] ?? false),
            sortBy: $data['sort_by'] ?? 'created_at',
            sortDirection: $data['sort_direction'] ?? 'desc',
        );
    }
}
