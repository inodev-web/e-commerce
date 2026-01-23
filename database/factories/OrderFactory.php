<?php

namespace Database\Factories;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'phone' => '05' . $this->faker->numerify('########'),
            'address' => $this->faker->address(),
            'wilaya_name' => $this->faker->city(),
            'commune_name' => $this->faker->city(),
            'delivery_type' => $this->faker->randomElement(DeliveryType::cases()),
            'delivery_price' => $this->faker->randomFloat(2, 300, 1000),
            'products_total' => $this->faker->randomFloat(2, 1000, 5000),
            'discount_total' => 0,
            'total_price' => function (array $attributes) {
                return $attributes['products_total'] + $attributes['delivery_price'];
            },
            'status' => OrderStatus::PENDING,
        ];
    }
}
