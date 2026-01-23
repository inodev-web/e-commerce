<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DeliveryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', function () {
    return redirect()->route('products.index');
});

Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::get('/wilayas', [\App\Http\Controllers\WilayaController::class, 'index'])->name('wilayas.index');

// Cart Routes
Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'show'])->name('show');
    Route::post('/add', [CartController::class, 'addItem'])->name('add');
    Route::put('/{item}', [CartController::class, 'updateItem'])->name('update');
    Route::delete('/{item}', [CartController::class, 'removeItem'])->name('remove');
    Route::post('/clear', [CartController::class, 'clear'])->name('clear');
});

// Authenticated Routes
Route::middleware(['auth:sanctum'])->group(function () {
    
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

    // Profile
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [\App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    // Checkout
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'show'])->name('show');
        Route::post('/calculate-shipping', [CheckoutController::class, 'calculateShipping'])->name('shipping');
        Route::post('/place', [CheckoutController::class, 'placeOrder'])->name('place');
        Route::get('/success/{order}', [CheckoutController::class, 'success'])->name('success');
    });
});

// Admin Routes
Route::prefix('admin')->name('admin.')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Product Management
    Route::resource('products', ProductController::class)->except(['index', 'show']);
    
    // Category Management
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);
    Route::post('categories/{category}/sub-categories', [\App\Http\Controllers\Admin\CategoryController::class, 'storeSubCategory'])->name('categories.sub-categories.store');

    // Order Management
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', function (\App\Models\Order $order, Request $request, \App\Services\OrderService $orderService) {
        $request->validate(['status' => 'required|string']);
        $orderService->updateStatus($order, \App\Enums\OrderStatus::from($request->status));
        return back()->with('success', 'Statut de la commande mis à jour.');
    })->name('orders.status.update');

    // Delivery Tariffs CRUD
    Route::resource('delivery', DeliveryController::class);
    Route::post('delivery/{deliveryTariff}/toggle', [DeliveryController::class, 'toggleActive'])->name('delivery.toggle');
});


require __DIR__.'/auth.php';
