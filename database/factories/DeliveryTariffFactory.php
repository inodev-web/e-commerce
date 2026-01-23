<?php

namespace Database\Factories;

use App\Enums\DeliveryType;
use App\Models\DeliveryTariff;
use App\Models\Wilaya;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryTariffFactory extends Factory
{
    protected $model = DeliveryTariff::class;

    public function definition(): array
    {
        return [
            'wilaya_id' => Wilaya::factory(),
            'type' => $this->faker->randomElement(DeliveryType::cases()),
            'price' => $this->faker->randomFloat(2, 300, 1500),
            'is_active' => true,
        ];
    }
}
