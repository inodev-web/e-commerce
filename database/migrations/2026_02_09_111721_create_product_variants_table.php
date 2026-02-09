<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('sku')->unique();
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('product_id');
            $table->index('is_active');
        });
        
        // Create pivot table for variant specifications
        Schema::create('product_variant_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('specification_id')->constrained()->restrictOnDelete();
            $table->timestamps();
            
            $table->index(['product_variant_id', 'specification_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variant_specifications');
        Schema::dropIfExists('product_variants');
    }
};
