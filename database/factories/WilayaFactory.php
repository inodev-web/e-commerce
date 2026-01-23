<?php

namespace Database\Factories;

use App\Models\Wilaya;
use Illuminate\Database\Eloquent\Factories\Factory;

class WilayaFactory extends Factory
{
    protected $model = Wilaya::class;

    public function definition(): array
    {
        return [
            'code' => $this->faker->unique()->numerify('##'),
            'name' => $this->faker->city(),
            'name_ar' => 'ولاية ' . $this->faker->city(),
            'is_active' => true,
        ];
    }
}
