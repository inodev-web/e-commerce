<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone');
            $table->foreignId('wilaya_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('commune_id')->nullable()->constrained()->restrictOnDelete();
            $table->text('address')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('phone');
            $table->index('wilaya_id');
            $table->index('commune_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
