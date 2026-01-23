<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartFactory extends Factory
{
    protected $model = Cart::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'session_id' => null,
        ];
    }

    public function guest(): self
    {
        return $this->state(fn (array $attributes) => [
            'client_id' => null,
            'session_id' => $this->faker->uuid(),
        ]);
    }
}
