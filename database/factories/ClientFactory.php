<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Commune;
use App\Models\User;
use App\Models\Wilaya;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'phone' => '05' . $this->faker->numerify('########'),
            'wilaya_id' => Wilaya::factory(),
            'commune_id' => function (array $attributes) {
                return Commune::factory()->create(['wilaya_id' => $attributes['wilaya_id']])->id;
            },
            'address' => $this->faker->address(),
        ];
    }
}
