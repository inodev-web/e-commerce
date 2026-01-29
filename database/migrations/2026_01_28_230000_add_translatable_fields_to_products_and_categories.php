<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            // PostgreSQL requires explicit casting
            DB::statement('ALTER TABLE categories ALTER COLUMN name TYPE json USING \'{}\'::json');
            DB::statement('ALTER TABLE products ALTER COLUMN name TYPE json USING \'{}\'::json');
            DB::statement('ALTER TABLE products ALTER COLUMN description TYPE json USING \'{}\'::json');
            DB::statement('ALTER TABLE sub_categories ALTER COLUMN name TYPE json USING \'{}\'::json');
            DB::statement('ALTER TABLE specifications ALTER COLUMN name TYPE json USING \'{}\'::json');
        } else {
            // MySQL/MariaDB can handle it differently
            DB::statement('ALTER TABLE categories MODIFY COLUMN name JSON');
            DB::statement('ALTER TABLE products MODIFY COLUMN name JSON');
            DB::statement('ALTER TABLE products MODIFY COLUMN description JSON NULL');
            DB::statement('ALTER TABLE sub_categories MODIFY COLUMN name JSON');
            DB::statement('ALTER TABLE specifications MODIFY COLUMN name JSON');
        }
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE categories ALTER COLUMN name TYPE VARCHAR(255) USING name::text');
            DB::statement('ALTER TABLE products ALTER COLUMN name TYPE VARCHAR(255) USING name::text');
            DB::statement('ALTER TABLE products ALTER COLUMN description TYPE TEXT USING description::text');
            DB::statement('ALTER TABLE sub_categories ALTER COLUMN name TYPE VARCHAR(255) USING name::text');
            DB::statement('ALTER TABLE specifications ALTER COLUMN name TYPE VARCHAR(255) USING name::text');
        } else {
            DB::statement('ALTER TABLE categories MODIFY COLUMN name VARCHAR(255)');
            DB::statement('ALTER TABLE products MODIFY COLUMN name VARCHAR(255)');
            DB::statement('ALTER TABLE products MODIFY COLUMN description TEXT NULL');
            DB::statement('ALTER TABLE sub_categories MODIFY COLUMN name VARCHAR(255)');
            DB::statement('ALTER TABLE specifications MODIFY COLUMN name VARCHAR(255)');
        }
    }
};
