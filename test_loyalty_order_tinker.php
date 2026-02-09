<?php

use App\DTOs\CreateOrderDTO;
use App\Enums\DeliveryType;
use App\Models\User;
use App\Services\OrderService;
use App\Services\LoyaltyService;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

// Mock Auth
$user = User::whereHas('client')->first();
if (!$user) {
    echo "No user with client.\n";
    return;
}
Auth::login($user);

$loyaltyService = app(LoyaltyService::class);
$currentPoints = $loyaltyService->getBalance($user->client->id);
if ($currentPoints < 500) {
    \App\Models\LoyaltyPoint::create([
        'client_id' => $user->client->id,
        'points' => 1000,
        'description' => 'Test points',
    ]);
    echo "Granted 1000 points. Now: " . ($currentPoints + 1000) . "\n";
} else {
    echo "User has $currentPoints points.\n";
}

$product = Product::first();
if (!$product) {
    echo "No product.\n";
    return;
}

$dto = new CreateOrderDTO(
    clientId: $user->client->id,
    items: [$product->id => ['quantity' => 1, 'specification_values' => []]],
    firstName: 'Test',
    lastName: 'User',
    phone: '0555555555',
    address: 'Test Address',
    wilayaId: 1, 
    communeId: 1, 
    deliveryType: DeliveryType::DOMICILE,
    promoCode: null,
    loyaltyPointsUsed: 10, // Use 10 points
    clearCart: false
);

try {
    $orderService = app(OrderService::class);
    $order = $orderService->create($dto);
    
    echo "Order #{$order->id} Total: {$order->total_price}\n";
    
    // Check if points were deducted
    $newPoints = $loyaltyService->getBalance($user->client->id);
    echo "New Balance: $newPoints\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
