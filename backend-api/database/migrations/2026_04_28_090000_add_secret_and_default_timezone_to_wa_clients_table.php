<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wa_clients', function (Blueprint $table): void {
            if (! Schema::hasColumn('wa_clients', 'default_timezone')) {
                $table->string('default_timezone')->nullable()->after('timezone');
            }

            if (! Schema::hasColumn('wa_clients', 'secret_key')) {
                $table->string('secret_key')->nullable()->after('default_timezone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('wa_clients', function (Blueprint $table): void {
            if (Schema::hasColumn('wa_clients', 'secret_key')) {
                $table->dropColumn('secret_key');
            }

            if (Schema::hasColumn('wa_clients', 'default_timezone')) {
                $table->dropColumn('default_timezone');
            }
        });
    }
};

