<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ss_days', function (Blueprint $table) {
            $table->string('cover_image_url')->nullable()->after('media_links');
        });
    }

    public function down(): void
    {
        Schema::table('ss_days', function (Blueprint $table) {
            $table->dropColumn('cover_image_url');
        });
    }
};

