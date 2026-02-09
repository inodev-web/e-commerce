<?php

use App\Models\User;
use App\Services\LoyaltyService;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = User::with('client')->get();
$loyaltyService = app(LoyaltyService::class);

foreach ($users as $user) {
    if ($user->client) {
        $points = $loyaltyService->getBalance($user->client->id);
        echo "User: {$user->email} (Client ID: {$user->client->id}) - Points: {$points}\n";
    } else {
        echo "User: {$user->email} - No Client Profile\n";
    }
}
