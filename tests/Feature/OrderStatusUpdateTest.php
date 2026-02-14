<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Client;
use App\Models\Wilaya;
use App\Models\Commune;
use App\Models\Specification;
use App\Models\ProductSpecificationValue;
use App\Models\LoyaltySetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class OrderStatusUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'client']);
        
        // Setup Loyalty Settings
        // Setup Loyalty Settings
        LoyaltySetting::create([
            'referral_reward_points' => 500,
            'referral_discount_amount' => 200,
            'points_conversion_rate' => 0.1,
        ]);
    }

    /** @test */
    public function admin_can_update_order_status_to_delivered_with_specs_and_referrals()
    {
        $this->withoutExceptionHandling();

        // 1. Setup Admin
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // 2. Setup Referrer
        $referrerUser = User::factory()->create(['referral_code' => 'REF123']);
        $referrerClient = Client::factory()->create(['user_id' => $referrerUser->id]);

        // 3. Setup Product with Specs
        $product = Product::factory()->create(['stock' => 10, 'price' => 1000]);

        $category = \App\Models\Category::factory()->create();
        $subCategory = \App\Models\SubCategory::factory()->create(['category_id' => $category->id]);

        $spec = Specification::create([
            'name' => 'Color',
            'sub_category_id' => $subCategory->id,
            'required' => false
        ]);

        $pv = ProductSpecificationValue::create([
            'product_id' => $product->id,
            'specification_id' => $spec->id,
            'value' => 'Red',
            'quantity' => 5
        ]);

        // 4. Create Order
        $order = Order::factory()->create([
            'status' => OrderStatus::PENDING,
            'total_price' => 2000,
            'referrer_id' => $referrerUser->id,
            'referral_code' => 'REF123',
            'client_id' => Client::factory()->create()->id
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_snapshot' => 1000,
            'metadata_snapshot' => [
                'name' => 'Test Product',
                'specifications' => [
                    ['n' => 'Color', 'v' => 'Red']
                ]
            ]
        ]);

        // 4. Act
        $response = $this->actingAs($admin)
            ->patch(route('admin.orders.status.update', $order->id), [
                'status' => 'delivered' // Lowercase to reproduce issue
            ]);

        // 5. Assert
        if (session('error')) {
            dump(session('error'));
        }
        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');
        
        $this->assertEquals(OrderStatus::DELIVERED, $order->fresh()->status);
        
        // Check Main Stock
        $this->assertEquals(9, $product->fresh()->stock);
        
        // Check Spec Stock
        $this->assertEquals(4, $pv->fresh()->quantity);
        
        // Check Loyalty Points for Referrer
        $this->assertDatabaseHas('loyalty_points', [
            'client_id' => $referrerClient->id,
            'points' => 500
        ]);
    }
}
