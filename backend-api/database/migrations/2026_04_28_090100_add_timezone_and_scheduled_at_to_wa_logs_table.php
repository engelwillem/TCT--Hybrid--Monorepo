<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wa_logs', function (Blueprint $table): void {
            if (! Schema::hasColumn('wa_logs', 'timezone')) {
                $table->string('timezone', 64)->nullable()->after('message');
            }

            if (! Schema::hasColumn('wa_logs', 'scheduled_at')) {
                $table->dateTime('scheduled_at')->nullable()->after('timezone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('wa_logs', function (Blueprint $table): void {
            if (Schema::hasColumn('wa_logs', 'scheduled_at')) {
                $table->dropColumn('scheduled_at');
            }

            if (Schema::hasColumn('wa_logs', 'timezone')) {
                $table->dropColumn('timezone');
            }
        });
    }
};
