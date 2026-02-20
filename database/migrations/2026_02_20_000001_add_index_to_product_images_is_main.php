<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // On vérifie d'abord si la table et la colonne existent
        if (Schema::hasTable('product_images') && Schema::hasColumn('product_images', 'is_main')) {
            
            Schema::table('product_images', function (Blueprint $table) {
                // Laravel possède maintenant une méthode native pour vérifier l'existence d'un index
                // Cependant, la méthode la plus sûre et "Laravel way" est de simplement 
                // tenter l'ajout. Si vous voulez éviter l'erreur de doublon :
                
                $conn = Schema::getConnection();
                $dbSchema = $conn->getSchemaBuilder();
                
                // Vérification moderne des index
                if (!$dbSchema->hasIndex('product_images', ['product_id', 'is_main'])) {
                    $table->index(['product_id', 'is_main']);
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            // Utilisation d'un tableau pour que Laravel trouve le nom de l'index automatiquement
            $table->dropIndex(['product_id', 'is_main']);
        });
    }
};