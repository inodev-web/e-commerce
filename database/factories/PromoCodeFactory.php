<?php

namespace Database\Factories;

use App\Enums\PromoCodeType;
use App\Models\PromoCode;
use Illuminate\Database\Eloquent\Factories\Factory;

class PromoCodeFactory extends Factory
{
    protected $model = PromoCode::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('PROMO-####')),
            'type' => $this->faker->randomElement(PromoCodeType::cases()),
            'discount_value' => $this->faker->randomFloat(2, 5, 50),
            'max_use' => $this->faker->numberBetween(10, 100),
            'expiry_date' => $this->faker->dateTimeBetween('+1 month', '+1 year'),
            'is_active' => true,
        ];
    }

    public function expired(): self
    {
        return $this->state(fn (array $attributes) => [
            'expiry_date' => $this->faker->dateTimeBetween('-1 year', '-1 month'),
        ]);
    }

    public function inactive(): self
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
