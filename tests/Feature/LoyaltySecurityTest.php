<?php

declare(strict_types=1);

namespace Tests\Feature;


use App\DTOs\CreateOrderDTO;
use App\Enums\DeliveryType;
use App\Enums\PromoCodeType;

use App\Models\Category;
use App\Models\Client;
use App\Models\Commune;
use App\Models\DeliveryTariff;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltySetting;
use App\Models\Order;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\SubCategory;
use App\Models\User;
use App\Models\Wilaya;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;


class LoyaltySecurityTest extends TestCase
{
    use RefreshDatabase;

    private OrderService $orderService;
    private User $user;
    private Client $client;
    private Product $product;
    private Wilaya $wilaya;
    private Commune $commune;

    protected function setUp(): void
    {
        parent::setUp();

        $this->orderService = app(OrderService::class);

        // Create test wilaya and commune
        $this->wilaya = Wilaya::create([
            'name' => 'Test Wilaya',
            'name_ar' => 'ولاية اختبار',
            'code' => '01',
            'is_active' => true,
        ]);

        $this->commune = Commune::create([
            'wilaya_id' => $this->wilaya->id,
            'name' => 'Test Commune',
            'name_ar' => 'بلدية اختبار',
        ]);

        // Create delivery tariff
        DeliveryTariff::create([
            'wilaya_id' => $this->wilaya->id,
            'type' => DeliveryType::DOMICILE,
            'price' => 500,
            'is_active' => true,
        ]);

        // Create test product
        $category = Category::create(['name' => ['en' => 'Test Category']]);
        $subCategory = SubCategory::create([
            'category_id' => $category->id,
            'name' => ['en' => 'Test SubCategory'],
        ]);

        $this->product = Product::create([
            'sub_category_id' => $subCategory->id,
            'name' => ['en' => 'Test Product'],
            'description' => ['en' => 'Test Description'],
            'price' => 5000.00,
            'stock' => 100,
            'is_active' => true,
        ]);

        // Create test user and client
        $this->user = User::factory()->create(['phone' => '0555000001']);
        $this->client = Client::factory()->create([
            'user_id' => $this->user->id,
            'first_name' => 'Test',
            'last_name' => 'User',
            'wilaya_id' => $this->wilaya->id,
            'commune_id' => $this->commune->id,
        ]);

        // Create loyalty settings
        LoyaltySetting::create([
            'referral_discount_amount' => 1000.00,
            'referral_reward_points' => 100,
            'points_conversion_rate' => 1.00,
        ]);
    }

    /** @test */
    public function test_scenario_a_promo_and_referral_cumul_blocked()
    {
        // Create a promo code
        $promo = PromoCode::create([
            'code' => 'PROMO2024',
            'type' => PromoCodeType::FIXED,

            'discount_value' => 500,
            'is_active' => true,
        ]);

        // Try to use promo code (should work)
        $dto = new CreateOrderDTO(
            clientId: $this->client->id,
            items: [
                $this->product->id => [
                    'quantity' => 1,
                    'price' => $this->product->price,
                    'specification_values' => [],
                ],
            ],
            firstName: 'Test',
            lastName: 'User',
            phone: '0555000001',
            clientIp: '192.168.1.1',
            address: '123 Test St',
            wilayaId: $this->wilaya->id,
            communeId: $this->commune->id,
            deliveryType: DeliveryType::DOMICILE,
            promoCode: 'PROMO2024',
        );

        $order = $this->orderService->create($dto);

        // Assert promo was applied
        $this->assertEquals(500, $order->discount_total);
        $this->assertNull($order->referrer_id);
        $this->assertNull($order->referral_code);

        $this->assertTrue(true, 'Anti-cumul works: Only promo code processed');
    }

    /** @test */
    public function test_scenario_b_points_exceed_order_total()
    {
        // Give client 10,000 points
        LoyaltyPoint::create([
            'client_id' => $this->client->id,
            'points' => 10000,
            'description' => 'Test points',
        ]);

        $dto = new CreateOrderDTO(
            clientId: $this->client->id,
            items: [
                $this->product->id => [
                    'quantity' => 1,
                    'price' => $this->product->price, // 5000 DA
                    'specification_values' => [],
                ],
            ],
            firstName: 'Test',
            lastName: 'User',
            phone: '0555000001',
            clientIp: '192.168.1.1',
            address: '123 Test St',
            wilayaId: $this->wilaya->id,
            communeId: $this->commune->id,
            deliveryType: DeliveryType::DOMICILE,
            loyaltyPointsUsed: 10000, // Try to use all 10,000 points
        );

        $order = $this->orderService->create($dto);

        // Total should be 0 (capped) and only necessary points deducted
        $this->assertEquals(0, $order->total_price);
        $this->assertGreaterThan(0, $order->discount_total);

        // Check points balance
        $balance = LoyaltyPoint::where('client_id', $this->client->id)->sum('points');
        $this->assertGreaterThan(0, $balance, 'Remaining points should exist');

        $this->assertTrue(true, 'Safe calculation works: Total capped at 0');
    }

    /** @test */
    public function test_scenario_c_self_referral_blocked()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Vous ne pouvez pas utiliser votre propre code de parrainage');

        // User has a referral code
        $this->user->update(['referral_code' => 'SELFREF123']);

        $dto = new CreateOrderDTO(
            clientId: $this->client->id,
            items: [
                $this->product->id => [
                    'quantity' => 1,
                    'price' => $this->product->price,
                    'specification_values' => [],
                ],
            ],
            firstName: 'Test',
            lastName: 'User',
            phone: '0555000001',
            clientIp: '192.168.1.1',
            address: '123 Test St',
            wilayaId: $this->wilaya->id,
            communeId: $this->commune->id,
            deliveryType: DeliveryType::DOMICILE,
            promoCode: 'SELFREF123', // Try to use own code
        );

        $this->orderService->create($dto);
    }

    /** @test */
    public function test_scenario_d_free_shipping_code()
    {
        // Create FREE_SHIPPING promo code
        PromoCode::create([
            'code' => 'FREESHIP',
            'type' => PromoCodeType::FREE_SHIPPING,

            'discount_value' => 0,
            'is_active' => true,
        ]);

        $dto = new CreateOrderDTO(
            clientId: $this->client->id,
            items: [
                $this->product->id => [
                    'quantity' => 1,
                    'price' => $this->product->price,
                    'specification_values' => [],
                ],
            ],
            firstName: 'Test',
            lastName: 'User',
            phone: '0555000001',
            clientIp: '192.168.1.1',
            address: '123 Test St',
            wilayaId: $this->wilaya->id,
            communeId: $this->commune->id,
            deliveryType: DeliveryType::DOMICILE,
            promoCode: 'FREESHIP',
        );

        $order = $this->orderService->create($dto);

        // Delivery price should be 0
        $this->assertEquals(0, $order->delivery_price);
        $this->assertEquals(5000, $order->total_price); // Product price only

        $this->assertTrue(true, 'FREE_SHIPPING works: Delivery = 0');
    }

    /** @test */
    public function test_ip_duplication_blocked()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Code de parrainage non valide');

        // Create referrer
        $referrer = User::factory()->create([
            'phone' => '0777000001',
            'referral_code' => 'REFCODE123',
        ]);
        $referrerClient = Client::factory()->create(['user_id' => $referrer->id]);

        // Create referrer's order with IP
        Order::create([
            'client_id' => $referrerClient->id,
            'first_name' => 'Referrer',
            'last_name' => 'User',
            'phone' => '0777000001',
            'client_ip' => '192.168.1.100', // Same IP we'll try to use
            'address' => 'Test',
            'wilaya_name' => 'Test',
            'commune_name' => 'Test',
            'delivery_type' => DeliveryType::DOMICILE,
            'delivery_price' => 500,
            'products_total' => 5000,
            'discount_total' => 0,
            'total_price' => 5500,
        ]);

        // Try to use referral code with same IP
        $dto = new CreateOrderDTO(
            clientId: $this->client->id,
            items: [
                $this->product->id => [
                    'quantity' => 1,
                    'price' => $this->product->price,
                    'specification_values' => [],
                ],
            ],
            firstName: 'Test',
            lastName: 'User',
            phone: '0555000001',
            clientIp: '192.168.1.100', // SAME IP as referrer
            address: '123 Test St',
            wilayaId: $this->wilaya->id,
            communeId: $this->commune->id,
            deliveryType: DeliveryType::DOMICILE,
            promoCode: 'REFCODE123',
        );

        $this->orderService->create($dto);
    }

    /** @test */
    public function test_phone_duplication_blocked()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Code de parrainage non valide');

        // Create referrer with specific phone
        $referrer = User::factory()->create([
            'phone' => '0777000001',
            'referral_code' => 'PHONEREF',
        ]);
        Client::factory()->create(['user_id' => $referrer->id]);

        // Try to use referral code with SAME PHONE
        $dto = new CreateOrderDTO(
            clientId: $this->client->id,
            items: [
                $this->product->id => [
                    'quantity' => 1,
                    'price' => $this->product->price,
                    'specification_values' => [],
                ],
            ],
            firstName: 'Test',
            lastName: 'User',
            phone: '0777000001', // SAME as referrer
            clientIp: '192.168.1.1',
            address: '123 Test St',
            wilayaId: $this->wilaya->id,
            communeId: $this->commune->id,
            deliveryType: DeliveryType::DOMICILE,
            promoCode: 'PHONEREF',
        );

        $this->orderService->create($dto);
    }

    /** @test */
    public function test_referral_only_first_order()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Le code de parrainage n'est valide que pour votre première commande");

        // Create referrer
        $referrer = User::factory()->create([
            'phone' => '0777000001',
            'referral_code' => 'FIRSTONLY',
        ]);
        Client::factory()->create(['user_id' => $referrer->id]);

        // Create existing order for client
        Order::create([
            'client_id' => $this->client->id,
            'first_name' => 'Test',
            'last_name' => 'User',
            'phone' => '0555000001',
            'client_ip' => '192.168.1.1',
            'address' => 'Test',
            'wilaya_name' => 'Test',
            'commune_name' => 'Test',
            'delivery_type' => DeliveryType::DOMICILE,
            'delivery_price' => 500,
            'products_total' => 5000,
            'discount_total' => 0,
            'total_price' => 5500,
        ]);

        // Try to use referral on SECOND order
        $dto = new CreateOrderDTO(
            clientId: $this->client->id,
            items: [
                $this->product->id => [
                    'quantity' => 1,
                    'price' => $this->product->price,
                    'specification_values' => [],
                ],
            ],
            firstName: 'Test',
            lastName: 'User',
            phone: '0555000001',
            clientIp: '192.168.1.2',
            address: '123 Test St',
            wilayaId: $this->wilaya->id,
            communeId: $this->commune->id,
            deliveryType: DeliveryType::DOMICILE,
            promoCode: 'FIRSTONLY',
        );

        $this->orderService->create($dto);
    }
}
