<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_tariffs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('wilaya_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // DOMICILE, BUREAU
            $table->decimal('price', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['wilaya_id', 'type']); // CONTRAINTE UNIQUE pour upsert
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_tariffs');
    }
};
