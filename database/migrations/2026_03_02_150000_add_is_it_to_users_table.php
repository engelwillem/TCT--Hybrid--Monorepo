<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'is_it')) {
                $table->boolean('is_it')->default(false)->after('is_admin');
            }
        });

        // Keep backward compatibility: current admins are treated as IT by default.
        DB::table('users')->where('is_admin', true)->update(['is_it' => true]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'is_it')) {
                $table->dropColumn('is_it');
            }
        });
    }
};

