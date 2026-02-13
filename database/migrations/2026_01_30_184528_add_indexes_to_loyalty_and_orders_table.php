<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $indexes = ['client_id', 'created_at'];
        foreach ($indexes as $column) {
            try {
                Schema::table('loyalty_points', function (Blueprint $table) use ($column) {
                    $indexName = "loyalty_points_{$column}_index";
                    $exists = [];
                    if (DB::getDriverName() === 'pgsql') {
                        $exists = \Illuminate\Support\Facades\DB::select("SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'loyalty_points' AND indexname = ?", [$indexName]);
                    }
                    if (empty($exists)) {
                        $table->index($column, $indexName);
                    }
                });
            } catch (\Exception $e) {}
        }

        $orderIndexes = ['client_id', 'status', 'created_at'];
        foreach ($orderIndexes as $column) {
            try {
                Schema::table('orders', function (Blueprint $table) use ($column) {
                    $indexName = "orders_{$column}_index";
                    $exists = [];
                    if (DB::getDriverName() === 'pgsql') {
                        $exists = \Illuminate\Support\Facades\DB::select("SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'orders' AND indexname = ?", [$indexName]);
                    }
                    if (empty($exists)) {
                        $table->index($column, $indexName);
                    }
                });
            } catch (\Exception $e) {}
        }
    }

    public function down(): void
    {
        Schema::table('loyalty_points', function (Blueprint $table) {
            $indexes = ['client_id', 'created_at'];
            foreach ($indexes as $column) {
                $indexName = "loyalty_points_{$column}_index";
                // Only drop if it exists to avoid errors during rollback if it wasn't created by this migration
                // However, standard down usually attempts to drop. 
                // Given the messy state, checking before drop is also safer.
                // Given the messy state, checking before drop is also safer.
                $exists = [];
                if (DB::getDriverName() === 'pgsql') {
                    $exists = \Illuminate\Support\Facades\DB::select("SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'loyalty_points' AND indexname = ?", [$indexName]);
                }
                if (!empty($exists)) {
                    $table->dropIndex($indexName);
                }
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            $indexes = ['client_id', 'status', 'created_at'];
            foreach ($indexes as $column) {
                $indexName = "orders_{$column}_index";
                $exists = [];
                if (DB::getDriverName() === 'pgsql') {
                    $exists = \Illuminate\Support\Facades\DB::select("SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'orders' AND indexname = ?", [$indexName]);
                }
                if (!empty($exists)) {
                    $table->dropIndex($indexName);
                }
            }
        });
    }
};
