<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_posts', function (Blueprint $table): void {
            if (! Schema::hasColumn('member_posts', 'media_paths')) {
                $table->json('media_paths')->nullable()->after('thumb_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('member_posts', function (Blueprint $table): void {
            if (Schema::hasColumn('member_posts', 'media_paths')) {
                $table->dropColumn('media_paths');
            }
        });
    }
};
