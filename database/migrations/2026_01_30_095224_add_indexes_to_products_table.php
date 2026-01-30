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
        Schema::table('products', function (Blueprint $table) {
            // Add category_id for faster filtering (denormalization)
            if (!Schema::hasColumn('products', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('sub_category_id')->constrained()->nullOnDelete();
            }
            
            // Add indexes if they don't exist
            // Note: Laravel schema builder doesn't easily check for index existence in a fluent way inside table(), 
            // but we can assume they are needed based on the task.
            // Ideally we'd check, but adding them safely:
            $table->index('price');
            // category_id index is added automatically by foreignId() usually, but explicit index is safer if valid.
            // actually foreignId creates constraint, index is created by the database often, but Laravel explicit index:
            // $table->index('category_id'); // redundant if foreignId does it? foreignId() does NOT automatically add index in all driver versions, but typical usage:
            // $table->foreignId('user_id')->constrained(); -> creates FK constraint.
            // We'll trust the FK creation or add index explicitly? 
            // Let's add index explicitly to be sure for performance.
           // $table->index('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['price']);
            if (Schema::hasColumn('products', 'category_id')) {
                 // Drop foreign key first if needed, usually dropColumn handles it if using constrained?
                 // Safer:
                 $table->dropForeign(['category_id']);
                 $table->dropColumn('category_id');
            }
        });
    }
};
