<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\LoyaltyPoint;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoyaltyPointFactory extends Factory
{
    protected $model = LoyaltyPoint::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'points' => $this->faker->numberBetween(10, 500),
            'description' => $this->faker->sentence(),
        ];
    }
}
