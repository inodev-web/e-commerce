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

// MIGRATED REACT PAGES
Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('/auth', function () {
    return Inertia::render('Auth/Login', [
        'wilayas' => \App\Models\Wilaya::select('id', 'name')->orderBy('name')->get()
    ]);
})->name('auth');

Route::get('/shop', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
Route::get('/product/{product}', [\App\Http\Controllers\ProductController::class, 'show'])->name('products.show');

Route::get('/profile', function () {
    return Inertia::render('Profile/Edit');
})->name('profile');


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
        return $wilaya->communes()->orderBy('name')->select('id', 'name')->get();
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
    Route::get('/profile/referral', [\App\Http\Controllers\ProfileController::class, 'referral'])->name('profile.referral');
    Route::get('/profile/edit', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit'); // Changed URI to avoid conflict
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
