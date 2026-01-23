<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained()->restrictOnDelete();
            
            // Customer information snapshots
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone');
            $table->text('address');
            
            // Location snapshots (preserved even if wilaya/commune deleted)
            $table->string('wilaya_name');
            $table->string('commune_name');
            
            // Delivery information
            $table->string('delivery_type'); // DOMICILE, BUREAU
            $table->decimal('delivery_price', 10, 2); // Snapshot of delivery tariff
            
            // Price breakdown
            $table->decimal('products_total', 10, 2);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            
            // Order status
            $table->string('status')->default('PENDING'); // PENDING, PROCESSING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
            
            $table->timestamps();

            $table->index('client_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
