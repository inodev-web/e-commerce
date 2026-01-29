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
        if (!Schema::hasIndex('communes', 'communes_wilaya_id_index')) {
            Schema::table('communes', function (Blueprint $table) {
                $table->index('wilaya_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('communes', function (Blueprint $table) {
            $table->dropIndex(['wilaya_id']);
        });
    }
};
