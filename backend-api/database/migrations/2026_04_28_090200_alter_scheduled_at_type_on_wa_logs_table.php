<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('wa_logs', 'scheduled_at')) {
            return;
        }

        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE wa_logs MODIFY scheduled_at DATETIME NULL');
            return;
        }

        if ($driver === 'sqlite') {
            // SQLite stores datetime as TEXT/NUMERIC affinity; no strict alter needed.
            return;
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('wa_logs', 'scheduled_at')) {
            return;
        }

        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE wa_logs MODIFY scheduled_at TIMESTAMP NULL');
            return;
        }
    }
};

