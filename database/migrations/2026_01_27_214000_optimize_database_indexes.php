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
        Schema::table('sessions', function (Blueprint $table) {
            // Index sur l'ID de session pour accélérer le chargement
            if (!collect(Schema::getIndexes('sessions'))->pluck('name')->contains('sessions_id_index')) {
                $table->index('id');
            }
        });

        Schema::table('communes', function (Blueprint $table) {
            // Index sur wilaya_id pour accélérer le filtrage
            if (!collect(Schema::getIndexes('communes'))->pluck('name')->contains('communes_wilaya_id_index')) {
                $table->index('wilaya_id');
            }
        });
        
        // Note: users.phone est déjà unique, donc indexé implicitement.
        // wilayas.id et communes.id sont des clés primaires, donc indexées implicitement.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropIndex(['id']);
        });

        Schema::table('communes', function (Blueprint $table) {
            $table->dropIndex(['wilaya_id']);
        });
    }
};
