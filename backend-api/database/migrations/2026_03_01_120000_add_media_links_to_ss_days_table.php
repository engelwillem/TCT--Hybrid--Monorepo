<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ss_days', function (Blueprint $table) {
            $table->json('media_links')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('ss_days', function (Blueprint $table) {
            $table->dropColumn('media_links');
        });
    }
};

