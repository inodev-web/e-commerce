<?php

namespace Tests\Unit;

use App\Models\Client;
use App\Models\LoyaltyPoint;
use App\Services\LoyaltyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoyaltyServiceTest extends TestCase
{
    use RefreshDatabase;

    private LoyaltyService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LoyaltyService();
    }

    /** @test */
    public function it_calculates_and_awards_points_correctly_at_one_percent()
    {
        $client = Client::factory()->create();
        $orderTotal = 10000.00; // 10,000 DA

        $this->service->awardPoints($client->id, $orderTotal);

        $this->assertDatabaseHas('loyalty_points', [
            'client_id' => $client->id,
            'points' => 100, // 1% of 10,000
        ]);

        $this->assertEquals(100, $this->service->getBalance($client->id));
    }

    /** @test */
    public function it_converts_points_to_discount_correctly()
    {
        $client = Client::factory()->create();
        \App\Models\LoyaltySetting::create([
            'points_conversion_rate' => 1.00,
        ]);
        LoyaltyPoint::factory()->create([
            'client_id' => $client->id,
            'points' => 500,
        ]);

        $discount = $this->service->convertToDiscount($client->id, 200);

        $this->assertEquals(200.00, $discount);
        $this->assertEquals(300, $this->service->getBalance($client->id));

        $this->assertDatabaseHas('loyalty_points', [
            'client_id' => $client->id,
            'points' => -200,
        ]);
    }

    /** @test */
    public function it_throws_exception_when_converting_more_points_than_available()
    {
        $client = Client::factory()->create();
        LoyaltyPoint::factory()->create([
            'client_id' => $client->id,
            'points' => 100,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Points insuffisants');

        $this->service->convertToDiscount($client->id, 200);
    }
}
