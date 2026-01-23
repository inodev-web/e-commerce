<?php

namespace Tests\Unit;

use App\Models\PromoCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromoCodeTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_validates_active_and_non_expired_codes()
    {
        $promo = PromoCode::factory()->create([
            'is_active' => true,
            'expiry_date' => now()->addDay(),
        ]);

        $this->assertTrue($promo->isValid());
    }

    /** @test */
    public function it_rejects_inactive_codes()
    {
        $promo = PromoCode::factory()->inactive()->create();

        $this->assertFalse($promo->isValid());
    }

    /** @test */
    public function it_rejects_expired_codes()
    {
        $promo = PromoCode::factory()->expired()->create();

        $this->assertFalse($promo->isValid());
    }

    /** @test */
    public function it_calculates_percentage_discount_correctly()
    {
        $promo = PromoCode::factory()->create([
            'type' => \App\Enums\PromoCodeType::PERCENT,
            'discount_value' => 10, // 10%
        ]);

        $discount = $promo->calculateDiscount(1000);

        $this->assertEquals(100, $discount);
    }

    /** @test */
    public function it_calculates_fixed_discount_correctly()
    {
        $promo = PromoCode::factory()->create([
            'type' => \App\Enums\PromoCodeType::FIXED,
            'discount_value' => 500,
        ]);

        $discount = $promo->calculateDiscount(2000);

        $this->assertEquals(500, $discount);
    }

    /** @test */
    public function it_limits_fixed_discount_to_total_amount()
    {
        $promo = PromoCode::factory()->create([
            'type' => \App\Enums\PromoCodeType::FIXED,
            'discount_value' => 1000,
        ]);

        $discount = $promo->calculateDiscount(500);

        $this->assertEquals(500, $discount);
    }
}
