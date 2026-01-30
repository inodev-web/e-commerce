<?php

use App\Models\DeliveryTariff;
use App\Models\Wilaya;
use App\Enums\DeliveryType;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$wilayas = Wilaya::all();
$count = 0;

foreach ($wilayas as $wilaya) {
    // Stop desk
    if (!DeliveryTariff::where('wilaya_id', $wilaya->id)->where('type', 'stop_desk')->exists()) {
        DeliveryTariff::create([
            'wilaya_id' => $wilaya->id,
            'type' => 'stop_desk',
            'price' => 400.00,
            'is_active' => true,
            'estimated_days' => '2-4 jours'
        ]);
        $count++;
    }

    // Home
    if (!DeliveryTariff::where('wilaya_id', $wilaya->id)->where('type', 'home')->exists()) {
        DeliveryTariff::create([
            'wilaya_id' => $wilaya->id,
            'type' => 'home',
            'price' => 700.00,
            'is_active' => true,
            'estimated_days' => '1-3 jours'
        ]);
        $count++;
    }
}

echo "Seeded $count default delivery tariffs.\n";
