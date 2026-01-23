<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wilayas', function (Blueprint $table): void {
            $table->string('name_ar')->after('name');
            $table->string('code', 2)->unique()->after('id');
            
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::table('wilayas', function (Blueprint $table): void {
            $table->dropIndex(['code']);
            $table->dropColumn(['name_ar', 'code']);
        });
    }
};
