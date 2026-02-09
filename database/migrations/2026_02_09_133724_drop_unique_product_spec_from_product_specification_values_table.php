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
        try {
            Schema::table('product_specification_values', function (Blueprint $table) {
                $table->dropUnique('unique_product_spec');
            });
        } catch (\Exception $e) {
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_specification_values', function (Blueprint $table) {
            $table->unique(['product_id', 'specification_id'], 'unique_product_spec');
        });
    }
};
