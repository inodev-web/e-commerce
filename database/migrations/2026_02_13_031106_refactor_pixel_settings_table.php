<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('pixel_settings');
        
        Schema::create('pixel_settings', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // facebook, tiktok, google, snapchat, etc.
            $table->string('pixel_id');
            $table->string('name')->nullable(); // Optional name/label
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['platform', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pixel_settings');
        
        // Re-creating the old schema in case of rollback
        Schema::create('pixel_settings', function (Blueprint $table) {
            $table->id();
            $table->string('meta_pixel_id')->nullable();
            $table->string('google_pixel_id')->nullable();
            $table->string('tiktok_pixel_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
};
