<?php

namespace Tests\Feature;

use Inertia\Inertia;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Client;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.testing.ensure_pages_exist' => false]);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'client']);
    }

    /** @test */
    public function it_can_add_item_to_cart_statelessly()
    {
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->post(route('cart.add'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ], ['X-Inertia' => 'true']);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    /** @test */
    public function it_can_update_cart_item_quantity()
    {
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['stock' => 10]);
        
        $cart = Cart::factory()->create(['client_id' => $client->id]);
        $item = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user, 'sanctum')->put(route('cart.update', $item), [
            'quantity' => 5,
        ], ['X-Inertia' => 'true']);

        $response->assertRedirect();
        $this->assertEquals(5, $item->fresh()->quantity);
    }

    /** @test */
    public function it_can_remove_item_from_cart()
    {
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        
        $cart = Cart::factory()->create(['client_id' => $client->id]);
        $item = CartItem::factory()->create(['cart_id' => $cart->id]);

        $response = $this->actingAs($user, 'sanctum')->delete(route('cart.remove', $item), [], ['X-Inertia' => 'true']);

        $response->assertRedirect();
        $this->assertDatabaseMissing('cart_items', ['id' => $item->id]);
    }

    /** @test */
    public function it_can_clear_cart()
    {
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        
        $cart = Cart::factory()->create(['client_id' => $client->id]);
        CartItem::factory(3)->create(['cart_id' => $cart->id]);

        $response = $this->actingAs($user, 'sanctum')->post(route('cart.clear'), [], ['X-Inertia' => 'true']);

        $response->assertRedirect();
        $this->assertEquals(0, $cart->items()->count());
    }
}
