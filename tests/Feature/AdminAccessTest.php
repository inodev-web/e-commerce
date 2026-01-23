<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use Inertia\Inertia;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.testing.ensure_pages_exist' => false]);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'client']);
    }

    /** @test */
    public function it_allows_admin_to_access_dashboard()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin, 'sanctum')->get(route('admin.dashboard'));

        $response->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard'));
    }

    /** @test */
    public function it_denies_client_from_accessing_dashboard()
    {
        $client = User::factory()->create();
        $client->assignRole('client');

        $response = $this->actingAs($client, 'sanctum')->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    /** @test */
    public function it_denies_guest_from_accessing_dashboard()
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
    }
}
