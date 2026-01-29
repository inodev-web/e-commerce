<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            if (!Schema::hasColumn('orders', 'referrer_id')) {
                $table->foreignId('referrer_id')->nullable()->after('client_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('orders', 'referral_code')) {
                $table->string('referral_code', 20)->nullable()->after('referrer_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            if (Schema::hasColumn('orders', 'referrer_id')) {
                $table->dropForeign(['referrer_id']);
                $table->dropColumn('referrer_id');
            }
            if (Schema::hasColumn('orders', 'referral_code')) {
                $table->dropColumn('referral_code');
            }
        });
    }
};
