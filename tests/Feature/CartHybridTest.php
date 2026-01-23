<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Client;
use App\Models\Product;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartHybridTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_migrates_guest_cart_to_client_cart_on_login()
    {
        $sessionId = 'guest-session-123';
        $product = Product::factory()->create();
        
        // 1. Create guest cart
        $guestCart = Cart::factory()->guest()->create(['session_id' => $sessionId]);
        CartItem::factory()->create([
            'cart_id' => $guestCart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        // 2. Create user and client
        $user = User::factory()->create();
        $client = Client::factory()->create(['user_id' => $user->id]);

        // 3. Act: Simulate login and migration
        $service = new CartService();
        $service->migrateGuestCart($sessionId, $client->id);

        // 4. Assert
        $clientCart = Cart::where('client_id', $client->id)->first();
        $this->assertNotNull($clientCart);
        $this->assertEquals(2, $clientCart->items()->where('product_id', $product->id)->first()->quantity);
        
        // Guest cart should be deleted
        $this->assertDatabaseMissing('carts', ['id' => $guestCart->id]);
    }
}
