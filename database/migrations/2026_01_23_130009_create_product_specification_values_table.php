<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_specification_values', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('specification_id')->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->timestamps();

            $table->index('product_id');
            $table->index('specification_id');
            $table->unique(['product_id', 'specification_id'], 'unique_product_spec');
        });

        Schema::create('product_variants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->nullable()->unique();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('product_id');
            $table->index('sku');
        });

        Schema::create('product_variant_specifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('specification_id')->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->timestamps();

            $table->index('product_variant_id');
            $table->index('specification_id');
            $table->unique(['product_variant_id', 'specification_id'], 'unique_variant_spec');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variant_specifications');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_specification_values');
    }
};
