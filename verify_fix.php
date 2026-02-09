<?php

use App\Http\Requests\PlaceOrderRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Simulate the flat payload
$data = [
    'product_id' => 123,
    'quantity' => 2,
    'specification_values' => ['size' => 'L'],
    // Required fields to pass validation
    'first_name' => 'John',
    'last_name' => 'Doe',
    'phone' => '0550000000',
    'address' => '123 Main St',
    'wilaya_id' => 1,
    'commune_id' => 1,
    'delivery_type' => 'domicile',
];

// Create a request instance
$request = Request::create('/checkout/place', 'POST', $data);

// Resolve the FormRequest
$formRequest = new PlaceOrderRequest();
$formRequest->initialize($request->query->all(), $request->request->all(), $request->attributes->all(), $request->cookies->all(), $request->files->all(), $request->server->all(), $request->getContent());
$formRequest->setContainer($app);
$formRequest->setRedirector($app->make(Illuminate\Routing\Redirector::class));

// Manually call prepareForValidation (using reflection because it's protected)
$reflection = new ReflectionClass($formRequest);
$method = $reflection->getMethod('prepareForValidation');
$method->setAccessible(true);
$method->invoke($formRequest);

// Check if 'items' was merged
$items = $formRequest->input('items');

echo "Items: " . json_encode($items, JSON_PRETTY_PRINT) . "\n";

if (isset($items[123]) && $items[123]['quantity'] === 2) {
    echo "SUCCESS: Payload normalized correctly.\n";
    exit(0);
} else {
    echo "FAILURE: Payload normalization failed.\n";
    exit(1);
}
