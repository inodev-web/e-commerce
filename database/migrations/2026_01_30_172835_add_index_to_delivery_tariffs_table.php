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
        Schema::table('delivery_tariffs', function (Blueprint $table) {
            $table->index(['wilaya_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_tariffs', function (Blueprint $table) {
            $table->dropIndex(['wilaya_id', 'type']);
        });
    }
};
