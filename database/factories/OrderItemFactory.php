<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'quantity' => $this->faker->numberBetween(1, 3),
            'price_snapshot' => function (array $attributes) {
                return Product::find($attributes['product_id'])->price;
            },
            'metadata_snapshot' => function (array $attributes) {
                $product = Product::find($attributes['product_id']);
                return [
                    'name' => $product->name,
                    'specifications' => [],
                ];
            },
        ];
    }
}
