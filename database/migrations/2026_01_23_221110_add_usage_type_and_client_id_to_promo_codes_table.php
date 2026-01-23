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
        Schema::table('promo_codes', function (Blueprint $table) {
            $table->string('usage_type')->default('SHAREABLE')->after('type'); // PERSONAL, SHAREABLE
            $table->foreignId('client_id')->nullable()->after('usage_type')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promo_codes', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn(['usage_type', 'client_id']);
        });
    }
};
