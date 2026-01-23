<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('sub_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('required')->default(false);
            $table->timestamps();

            $table->index('sub_category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('specifications');
    }
};
