<?php

namespace Tests\Feature\Auth;

use App\Models\Wilaya;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class WilayaLoginFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_shows_only_active_wilayas()
    {
        // Create an active wilaya
        $activeWilaya = Wilaya::factory()->create([
            'name' => 'Active Wilaya',
            'is_active' => true,
        ]);

        // Create an inactive wilaya
        $inactiveWilaya = Wilaya::factory()->create([
            'name' => 'Inactive Wilaya',
            'is_active' => false,
        ]);

        $response = $this->get('/login');

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')
            ->has('wilayas', 1) // Should only have 1 wilaya
            ->where('wilayas.0.id', $activeWilaya->id)
            ->where('wilayas.0.name', 'Active Wilaya')
        );
    }

    public function test_register_page_shows_only_active_wilayas()
    {
        // Create an active wilaya
        $activeWilaya = Wilaya::factory()->create([
            'name' => 'Active Wilaya',
            'is_active' => true,
        ]);

        // Create an inactive wilaya
        $inactiveWilaya = Wilaya::factory()->create([
            'name' => 'Inactive Wilaya',
            'is_active' => false,
        ]);

        $response = $this->get('/register');

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login') // Register shares the Login component
            ->has('wilayas', 1) // Should only have 1 wilaya
            ->where('wilayas.0.id', $activeWilaya->id)
            ->where('wilayas.0.name', 'Active Wilaya')
        );
    }
}
