<?php

namespace Tests\Feature;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\PromoCodeType;
use App\Models\Category;
use App\Models\Client;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecificationValue;
use App\Models\PromoCode;
use App\Models\Specification;
use App\Models\SubCategory;
use App\Models\User;
use App\Models\Wilaya;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class EndToEndBusinessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        
        // Setup Roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'client']);
    }

    #[Test]
    public function it_runs_a_complete_business_cycle_successfully()
    {
        // 1. Admin creates a category, sub-category, and product with specifications
        $admin = User::factory()->create(['name' => 'Admin User']);
        $admin->assignRole('admin');

        $category = Category::create(['name' => 'Electronics', 'active' => true]);
        $subCategory = SubCategory::create([
            'category_id' => $category->id,
            'name' => 'Smartphones',
            'active' => true
        ]);

        $specification = Specification::create([
            'sub_category_id' => $subCategory->id,
            'name' => 'Storage',
            'required' => true
        ]);

        $productData = [
            'sub_category_id' => $subCategory->id,
            'name' => 'iPhone 15',
            'description' => 'Latest Apple Smartphone',
            'price' => 150000.00,
            'stock' => 50,
            'status' => ProductStatus::ACTIF->value,
            'specifications' => [
                ['id' => $specification->id, 'value' => '256GB']
            ]
        ];

        $this->actingAs($admin, 'sanctum')
            ->post(route('admin.products.store'), $productData)
            ->assertRedirect(route('admin.dashboard'));

        $product = Product::where('name', 'iPhone 15')->first();
        $this->assertNotNull($product);
        $this->assertDatabaseHas('product_specification_values', [
            'product_id' => $product->id,
            'value' => '256GB'
        ]);

        // 2. Client registers and validates OTP
        \Illuminate\Support\Facades\Auth::forgetUser();
        $this->flushSession();

        
        $clientResponse = $this->from(route('register'))->post(route('register'), [
            'name' => 'John Doe',
            'phone' => '0555001122',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $user = User::where('phone', '0555001122')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->otp_code);

        // Simulate OTP verification
        $this->actingAs($user, 'sanctum')
            ->post(route('otp.verify'), ['code' => $user->otp_code])
            ->assertRedirect(); 

        $user->refresh();
        $this->assertNotNull($user->phone_verified_at);

        // 3. Setup Wilaya and Promo Code
        $wilaya = Wilaya::create(['code' => '16', 'name' => 'Alger', 'name_ar' => 'الجزائر', 'is_active' => true]);
        $commune = Commune::create(['wilaya_id' => $wilaya->id, 'name' => 'Hydra', 'name_ar' => 'حيدرة']);
        DeliveryTariff::create([
            'wilaya_id' => $wilaya->id,
            'type' => DeliveryType::DOMICILE,
            'price' => 600.00,
            'is_active' => true
        ]);

        $promoCode = PromoCode::create([
            'code' => 'WELCOME10',
            'type' => PromoCodeType::PERCENT,
            'discount_value' => 10.00,
            'is_active' => true,
            'max_use' => 100
        ]);

        // 4. Client adds product to cart and applies promo code
        $client = $user->client;
        $client->update([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'wilaya_id' => $wilaya->id,
            'commune_id' => $commune->id,
            'address' => 'Hydra Street'
        ]);

        // Mock adding to cart (CartController)
        $this->actingAs($user, 'sanctum')
            ->post(route('cart.add'), [
                'product_id' => $product->id,
                'quantity' => 1
            ])
            ->assertRedirect();

        // 5. Client places order
        $checkoutData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '0555001122',
            'address' => 'Address 123',
            'wilaya_id' => $wilaya->id,
            'commune_id' => $commune->id,
            'delivery_type' => DeliveryType::DOMICILE->value,
            'promo_code' => 'WELCOME10'
        ];

        $this->actingAs($user, 'sanctum')
            ->post(route('checkout.place'), $checkoutData)
            ->assertRedirect();

        $order = Order::latest()->first();
        $this->assertNotNull($order);
        // Products total (150000) - 10% (15000) + Delivery (600) = 135600
        $this->assertEquals(135600.00, (float) $order->total_price);

        // 6. Admin changes order status to "Livré"
        $this->actingAs($admin, 'sanctum')
            ->patch(route('admin.orders.status.update', $order), [
                'status' => OrderStatus::DELIVERED->value
            ])->assertRedirect();

        // 7. Verify stock decreased and loyalty points added
        $product->refresh();
        $this->assertEquals(49, $product->stock);

        $client->refresh();
        $this->assertGreaterThan(0, $client->getTotalPoints());
    }
}
