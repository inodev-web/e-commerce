<?php

use Illuminate\Contracts\Console\Kernel;

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';

$app->make(Kernel::class)->bootstrap();

$orders = \App\Models\Order::all();

echo "Total Orders: " . $orders->count() . "\n";
echo "Counts by Status:\n";
foreach ($orders->groupBy('status') as $status => $group) {
    echo "Status: " . $status . " - Count: " . $group->count() . "\n";
}

echo "\nRaw DB Statuses:\n";
$rawStatuses = \Illuminate\Support\Facades\DB::table('orders')->select('status')->distinct()->pluck('status');
print_r($rawStatuses->toArray());
