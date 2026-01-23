<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Inertia\Inertia;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Client;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Wilaya;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OrderProcessTest extends TestCase
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
    public function it_processes_a_complete_checkout_successfully_with_jsonb_snapshots()
    {
        $this->withoutExceptionHandling();
        // 1. Setup data
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        $wilaya = Wilaya::factory()->create(['name' => 'Alger']);
        $commune = Commune::factory()->create(['wilaya_id' => $wilaya->id]);
        
        DeliveryTariff::factory()->create([
            'wilaya_id' => $wilaya->id,
            'type' => DeliveryType::DOMICILE,
            'price' => 500.00,
        ]);

        $product = Product::factory()->create([
            'name' => 'Smartphone X',
            'price' => 1000.00,
            'stock' => 10,
        ]);

        $cart = Cart::factory()->create(['client_id' => $client->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price_snapshot' => 1000.00,
        ]);

        // 2. Act
        $response = $this->actingAs($user, 'sanctum')->post(route('checkout.place'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '0555555555',
            'address' => '123 Street',
            'wilaya_id' => $wilaya->id,
            'commune_id' => $commune->id,
            'delivery_type' => DeliveryType::DOMICILE->value,
        ]);

        // 3. Assert
        $order = Order::first();
        $response->assertRedirect(route('checkout.success', $order));

        // Follow redirect to verify Inertia Page
        $response = $this->actingAs($user, 'sanctum')->get(route('checkout.success', $order));
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Checkout/Success')
            ->has('order')
            ->where('order.id', $order->id)
        );
        
        // Check Order
        $this->assertDatabaseHas('orders', [
            'client_id' => $client->id,
            'wilaya_name' => 'Alger',
            'delivery_price' => 500.00,
            'products_total' => 2000.00,
            'total_price' => 2500.00,
            'status' => OrderStatus::PENDING->value,
        ]);

        // Check Order Item and JSONB Snapshot
        $order = Order::first();
        $orderItem = OrderItem::where('order_id', $order->id)->first();
        
        // CRITIQUE: Vérification explicite du snapshot JSONB
        $this->assertEquals('Smartphone X', $orderItem->metadata_snapshot['name']);
        $this->assertIsArray($orderItem->metadata_snapshot['specifications']);

        // Check Stock Decrement
        $this->assertEquals(8, $product->fresh()->stock);

        // Check Cart Cleared
        $this->assertDatabaseMissing('carts', ['id' => $cart->id]);
    }

    /** @test */
    public function it_maintains_price_snapshot_integrity_even_if_product_price_changes()
    {
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['price' => 1000.00]);
        
        $wilaya = Wilaya::factory()->create();
        $commune = Commune::factory()->create(['wilaya_id' => $wilaya->id]);
        DeliveryTariff::factory()->create(['wilaya_id' => $wilaya->id, 'type' => DeliveryType::DOMICILE]);

        $cart = Cart::factory()->create(['client_id' => $client->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_snapshot' => 1000.00,
        ]);

        // Place order
        $response = $this->actingAs($user, 'sanctum')->post(route('checkout.place'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '0555555555',
            'address' => '123 Street',
            'wilaya_id' => $wilaya->id,
            'commune_id' => $commune->id,
            'delivery_type' => DeliveryType::DOMICILE->value,
        ]);

        $response->assertSessionHasNoErrors();

        // Change product price
        $product->update(['price' => 2000.00]);

        // Assert order item price is still 1000.00 (Snapshot integrity)
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'price_snapshot' => 1000.00,
        ]);
    }

    /** @test */
    public function it_rolls_back_transaction_if_stock_becomes_insufficient_during_process()
    {
        $this->withoutExceptionHandling();
        $user = User::factory()->create();
        $user->assignRole('client');
        $client = Client::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['stock' => 1]); // Only 1 in stock
        
        $wilaya = Wilaya::factory()->create();
        $commune = Commune::factory()->create(['wilaya_id' => $wilaya->id]);
        DeliveryTariff::factory()->create(['wilaya_id' => $wilaya->id, 'type' => DeliveryType::DOMICILE, 'is_active' => true]);

        $cart = Cart::factory()->create(['client_id' => $client->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2, // Ordering 2 but only 1 in stock
        ]);

        // Act
        $response = $this->actingAs($user, 'sanctum')->post(route('checkout.place'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '0555555555',
            'address' => '123 Street',
            'wilaya_id' => $wilaya->id,
            'commune_id' => $commune->id,
            'delivery_type' => DeliveryType::DOMICILE->value,
        ]);

        // Assert
        $response->assertRedirect();
        $response->assertSessionHas('error');
        
        // CRITIQUE: Vérifier le Rollback
        $this->assertEquals(0, Order::count(), 'Order should not be created');
        $this->assertEquals(1, $product->fresh()->stock, 'Stock should not be decremented');
        $this->assertDatabaseHas('carts', ['id' => $cart->id]);
    }
}
