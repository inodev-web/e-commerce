<?php

use App\DTOs\CreateOrderDTO;
use App\Enums\DeliveryType;
use App\Models\User;
use App\Services\OrderService;
use App\Services\LoyaltyService;
use App\Models\Product;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Find a user with points
$user = User::whereHas('client', function($q) {
    // Has points? logic
})->first();

// Or just find the first user and give them points
$user = User::first();
if (!$user || !$user->client) {
    die("No user with client found.\n");
}

$loyaltyService = app(LoyaltyService::class);
// Grant points if needed
$currentPoints = $loyaltyService->getBalance($user->client->id);
if ($currentPoints < 500) {
    \App\Models\LoyaltyPoint::create([
        'client_id' => $user->client->id,
        'points' => 1000,
        'description' => 'Test points',
    ]);
    echo "Granted 1000 points.\n";
} else {
    echo "User has $currentPoints points.\n";
}

$product = Product::first();
if (!$product) die("No product found.\n");

$dto = new CreateOrderDTO(
    clientId: $user->client->id,
    items: [$product->id => ['quantity' => 1, 'specification_values' => []]],
    firstName: 'Test',
    lastName: 'User',
    phone: '0555555555',
    address: 'Test Address',
    wilayaId: 1, // Adrar
    communeId: 1, // Adrar
    deliveryType: DeliveryType::DOMICILE,
    promoCode: null,
    loyaltyPointsUsed: 500, // Use 500 points
    clearCart: false
);

echo "Attempting to create order with 500 points used...\n";

try {
    $orderService = app(OrderService::class);
    $order = $orderService->create($dto);
    
    echo "Order Created: #{$order->id}\n";
    echo "Total Price: {$order->total_price}\n";
    
    // Check if points were deducted
    $newPoints = $loyaltyService->getBalance($user->client->id);
    echo "New Points Balance: $newPoints\n";
    
    // Check points usage in order (if recorded? strictly speaking it's in total price)
    // We expect price to be Product Price + Shipping - 500 (approx)
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
