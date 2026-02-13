<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Products Slugs
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'slug')) {
                    $table->string('slug')->nullable()->after('name');
                }
                
                if (!Schema::hasColumn('products', 'category_id')) {
                    $table->foreignId('category_id')->nullable()->after('slug')->constrained('categories')->nullOnDelete();
                }

                if (!Schema::hasColumn('products', 'sub_category_id')) {
                    $table->foreignId('sub_category_id')->nullable()->after('category_id')->constrained('sub_categories')->nullOnDelete();
                }
            });

            // Populate Slugs
            // On utilise DB::table pour éviter les soucis de cache Eloquent
            $products = \Illuminate\Support\Facades\DB::table('products')->whereNull('slug')->get();
            foreach ($products as $product) {
                $slug = Str::slug($product->name) . '-' . $product->id;
                \Illuminate\Support\Facades\DB::table('products')
                    ->where('id', $product->id)
                    ->update(['slug' => $slug]);
            }
            


            // Add Indexes Safely
            try {
                Schema::table('products', function (Blueprint $table) {
                     // Utilisation de Raw SQL pour vérifier l'index sur Postgres
                    $indexExists = [];
                    if (DB::getDriverName() === 'pgsql') {
                        $indexExists = \Illuminate\Support\Facades\DB::select("
                            SELECT 1 
                            FROM pg_indexes 
                            WHERE schemaname = 'public' 
                            AND tablename = 'products' 
                            AND indexname = 'products_slug_index'
                        ");
                    }
                    if (empty($indexExists)) {
                         $table->index('slug', 'products_slug_index');
                    }
                });
            } catch (\Exception $e) {}

            try {
                Schema::table('products', function (Blueprint $table) {
                    $catIndexExists = [];
                    if (DB::getDriverName() === 'pgsql') {
                        $catIndexExists = \Illuminate\Support\Facades\DB::select("
                            SELECT 1 
                            FROM pg_indexes 
                            WHERE schemaname = 'public' 
                            AND tablename = 'products' 
                            AND indexname = 'products_category_id_index'
                        ");
                    }
                    if (empty($catIndexExists)) {
                        $table->index('category_id', 'products_category_id_index');
                    }
                });
            } catch (\Exception $e) {}

            try {
                Schema::table('products', function (Blueprint $table) {
                    $subCatIndexExists = [];
                    if (DB::getDriverName() === 'pgsql') {
                        $subCatIndexExists = \Illuminate\Support\Facades\DB::select("
                            SELECT 1 
                            FROM pg_indexes 
                            WHERE schemaname = 'public' 
                            AND tablename = 'products' 
                            AND indexname = 'products_sub_category_id_index'
                        ");
                    }
                    if (empty($subCatIndexExists)) {
                        $table->index('sub_category_id', 'products_sub_category_id_index');
                    }
                });
            } catch (\Exception $e) {}

        }

        // 2. Users Referral
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'referral_code')) {
                $table->string('referral_code', 20)->unique()->nullable()->after('phone');
                $table->foreignId('referrer_id')->nullable()->constrained('users')->nullOnDelete();
            }
        });

        // Generate Referral Codes for existing users
        $users = User::whereNull('referral_code')->get();
        foreach ($users as $user) {
            $user->referral_code = strtoupper(Str::random(10));
            $user->saveQuietly();
        }

        // 3. Orders Indexes
        if (Schema::hasTable('orders')) {
            try {
                Schema::table('orders', function (Blueprint $table) {
                    $indexExists = [];
                    if (DB::getDriverName() === 'pgsql') {
                        $indexExists = \Illuminate\Support\Facades\DB::select("
                            SELECT 1 
                            FROM pg_indexes 
                            WHERE schemaname = 'public' 
                            AND tablename = 'orders' 
                            AND indexname = 'orders_client_id_index'
                        ");
                    }
                    
                    if (empty($indexExists)) {
                       $table->index('client_id', 'orders_client_id_index');
                    }
                });
            } catch (\Exception $e) {}
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'slug')) {
                $table->dropColumn('slug');
            }
            // Drop indexes if needed handled by dropColumn usually
        });

        Schema::table('users', function (Blueprint $table) {
             if (Schema::hasColumn('users', 'referrer_id')) {
                $table->dropForeign(['referrer_id']);
                $table->dropColumn('referrer_id');
             }
             if (Schema::hasColumn('users', 'referral_code')) {
                $table->dropColumn('referral_code');
             }
        });
    }
};
