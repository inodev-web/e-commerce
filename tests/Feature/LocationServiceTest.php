<?php

namespace Tests\Feature;

use App\Enums\DeliveryType;
use App\Models\DeliveryTariff;
use App\Models\Wilaya;
use App\Services\LocationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationServiceTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_correct_delivery_price_for_wilaya_and_type()
    {
        $wilaya = Wilaya::factory()->create();
        DeliveryTariff::factory()->create([
            'wilaya_id' => $wilaya->id,
            'type' => DeliveryType::DOMICILE,
            'price' => 600.00,
        ]);
        DeliveryTariff::factory()->create([
            'wilaya_id' => $wilaya->id,
            'type' => DeliveryType::BUREAU,
            'price' => 400.00,
        ]);

        $service = new LocationService();
        
        $this->assertEquals(600.00, $service->getDeliveryPrice($wilaya->id, DeliveryType::DOMICILE));
        $this->assertEquals(400.00, $service->getDeliveryPrice($wilaya->id, DeliveryType::BUREAU));
    }
}
