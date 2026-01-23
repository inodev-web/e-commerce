<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use Inertia\Inertia;

class OrderOwnershipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.testing.ensure_pages_exist' => false]);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'client']);
    }

    /** @test */
    public function it_allows_client_to_view_their_own_order()
    {
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        $order = Order::factory()->create(['client_id' => $client->id]);

        // Ensure the route exists and model binding works
        $response = $this->actingAs($user, 'sanctum')->get(route('orders.show', $order->id));

        $response->assertOk();
    }

    /** @test */
    public function it_denies_client_from_viewing_others_order()
    {
        $userA = User::factory()->create();
        $userA->assignRole('client');
        $clientA = Client::factory()->create(['user_id' => $userA->id]);
        
        $userB = User::factory()->create();
        $userB->assignRole('client');
        $clientB = Client::factory()->create(['user_id' => $userB->id]);
        
        $orderB = Order::factory()->create(['client_id' => $clientB->id]);

        $response = $this->actingAs($userA, 'sanctum')->get(route('orders.show', $orderB->id));

        $response->assertForbidden();
    }
}
