<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DeliveryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Admin\PromoCodeController;
use App\Http\Controllers\Admin\LoyaltyController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\PixelSettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// MIGRATED REACT PAGES
Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('/auth', function () {
    return Inertia::render('Auth/Login', [
        'wilayas' => \App\Models\Wilaya::active()->select('id', 'name', 'code')->orderBy('name')->get()
    ]);
})->name('auth');

Route::get('/shop', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
Route::get('/product/{product}', [\App\Http\Controllers\ProductController::class, 'show'])->name('products.show');

// Profile route is defined under auth middleware (see below).


// OLD ROUTES (Commented out/adapted for reference)
/*
Route::get('/', function () {
    return redirect()->route('products.index');
});
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
*/

Route::get('/wilayas', [\App\Http\Controllers\WilayaController::class, 'index'])->name('wilayas.index');
Route::get('/api/wilayas/{wilaya}/communes', function (\App\Models\Wilaya $wilaya) {
    return \Illuminate\Support\Facades\Cache::rememberForever("wilaya_{$wilaya->id}_communes", function () use ($wilaya) {
        return $wilaya->communes()->orderBy('name')->select('id', 'name', 'name_ar')->get();
    });
});

// Cart Routes (Might need refactoring for new frontend)
Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'show'])->name('show');
    Route::post('/add', [CartController::class, 'addItem'])->name('add');
    Route::put('/{item}', [CartController::class, 'updateItem'])->name('update');
    Route::delete('/{item}', [CartController::class, 'removeItem'])->name('remove');
    Route::post('/clear', [CartController::class, 'clear'])->name('clear');
});

// Authenticated Routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Dashboard Redirect
    Route::get('/dashboard', function () {
        if (auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('products.index');
    })->name('dashboard');

    // Profile & Phone Update
    Route::post('/profile/phone', function (Request $request, \App\Actions\Auth\UpdatePhoneAction $action) {
        $request->validate(['phone' => 'required|string|unique:users,phone,' . auth()->id()]);
        $action->execute(auth()->user(), $request->phone);
        return back()->with('success', 'Code OTP envoyé sur votre nouveau numéro.');
    })->name('profile.phone.update');

    Route::post('/verify-otp', function (Request $request, \App\Services\SmsService $smsService) {
        $request->validate(['code' => 'required|string']);
        if ($smsService->verifyOtp(auth()->user(), $request->code)) {
            return redirect()->intended(route('products.index'))->with('success', 'Téléphone vérifié.');
        }
        return back()->withErrors(['code' => 'Code OTP invalide.']);
    })->name('otp.verify');

    // Orders
    Route::resource('orders', OrderController::class)->only(['index', 'show']);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::get('orders/{order}/track', [\App\Http\Controllers\OrderController::class, 'show'])->name('orders.track');

    // Profile
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile');
    Route::get('/profile/referral', [\App\Http\Controllers\ProfileController::class, 'referral'])->name('profile.referral');
    Route::get('/profile/edit', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit'); // Changed URI to avoid conflict
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [\App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Checkout (Publicly accessible)
Route::prefix('checkout')->name('checkout.')->group(function () {
    Route::get('/', [CheckoutController::class, 'show'])->name('show');
    Route::post('/calculate-shipping', [CheckoutController::class, 'calculateShipping'])->name('shipping');
    Route::post('/validate-promo', [CheckoutController::class, 'validatePromoCode'])->name('validate-promo');
    Route::post('/place', [CheckoutController::class, 'placeOrder'])->name('place');
    Route::get('/success/{order}', [CheckoutController::class, 'success'])->name('success');
});

// Debug route for loyalty points
Route::get('/debug/loyalty-points', function (Request $request) {
    if (!auth()->check()) {
        return response()->json(['error' => 'Not authenticated'], 401);
    }
    
    $client = auth()->user()->client;
    if (!$client) {
        return response()->json(['error' => 'No client found'], 404);
    }
    
    $points = \App\Models\LoyaltyPoint::where('client_id', $client->id)->get();
    $balance = $points->sum('points');
    
    return response()->json([
        'client_id' => $client->id,
        'balance' => $balance,
        'points_count' => $points->count(),
        'points' => $points,
    ]);
})->middleware('auth')->name('debug.loyalty-points');

// Admin Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Product Management
    // Promo Codes
    Route::resource('promo-codes', \App\Http\Controllers\Admin\PromoCodeController::class);
    Route::post('promo-codes/{promoCode}/toggle', [\App\Http\Controllers\Admin\PromoCodeController::class, 'toggle'])->name('promo-codes.toggle');

    // Products
    Route::resource('products', \App\Http\Controllers\Admin\ProductController::class);

    // Loyalty Program
    Route::get('loyalty', [\App\Http\Controllers\Admin\LoyaltyController::class, 'index'])->name('loyalty.index');
    Route::get('loyalty/stats', [\App\Http\Controllers\Admin\LoyaltyController::class, 'getStats'])->name('loyalty.stats');
    Route::post('loyalty/adjust', [\App\Http\Controllers\Admin\LoyaltyController::class, 'manualAdjustment'])->name('loyalty.adjust');
    Route::get('loyalty/client/{client}', [\App\Http\Controllers\Admin\LoyaltyController::class, 'clientHistory'])->name('loyalty.client');
    Route::put('loyalty/settings', [\App\Http\Controllers\Admin\LoyaltyController::class, 'updateSettings'])->name('loyalty.settings.update');
    
    Route::get('loyalty/client/{client}', [\App\Http\Controllers\Admin\LoyaltyController::class, 'clientHistory'])->name('loyalty.client');
    
    // Customer Management
    Route::get('customers', [\App\Http\Controllers\Admin\CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/{client}', [\App\Http\Controllers\Admin\CustomerController::class, 'show'])->name('customers.show');
    Route::post('customers/{client}/toggle', [\App\Http\Controllers\Admin\CustomerController::class, 'toggle'])->name('customers.toggle');

    // Settings
    Route::get('settings/pixel', [\App\Http\Controllers\Admin\PixelSettingController::class, 'show'])->name('settings.pixel');
    Route::put('settings/pixel', [\App\Http\Controllers\Admin\PixelSettingController::class, 'update'])->name('settings.pixel.update');

    // Category Management
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);
    Route::post('categories/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update']);
    Route::post('categories/{category}/sub-categories', [\App\Http\Controllers\Admin\CategoryController::class, 'storeSubCategory'])->name('categories.sub-categories.store');
    Route::patch('sub-categories/{subCategory}', [\App\Http\Controllers\Admin\CategoryController::class, 'updateSubCategory'])->name('sub-categories.update');
    Route::delete('sub-categories/{subCategory}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroySubCategory'])->name('sub-categories.destroy');

    // Specifications
    Route::resource('specifications', \App\Http\Controllers\Admin\SpecificationController::class)->only(['store', 'update', 'destroy']);

    // Order Management
    Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', function (\App\Models\Order $order, Request $request, \App\Services\OrderService $orderService) {
        $request->validate(['status' => 'required|string']);
        $orderService->updateStatus($order, \App\Enums\OrderStatus::from($request->status));
        return back()->with('success', 'Statut de la commande mis à jour.');
    })->name('orders.status.update');

    // Delivery Tariffs CRUD
    Route::post('delivery/bulk-update', [DeliveryController::class, 'bulkUpdate'])->name('delivery.bulk-update');
    Route::resource('delivery', DeliveryController::class);
    Route::post('delivery/{deliveryTariff}/toggle', [DeliveryController::class, 'toggleActive'])->name('delivery.toggle');
});


require __DIR__.'/auth.php';
