<?php

namespace Database\Factories;

use App\Models\Commune;
use App\Models\Wilaya;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommuneFactory extends Factory
{
    protected $model = Commune::class;

    public function definition(): array
    {
        return [
            'wilaya_id' => Wilaya::factory(),
            'name' => $this->faker->city(),
            'name_ar' => 'بلدية ' . $this->faker->city(),
        ];
    }
}
