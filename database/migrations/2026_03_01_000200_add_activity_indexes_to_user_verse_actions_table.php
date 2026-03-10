<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_verse_actions', function (Blueprint $table) {
            $table->index(['user_id', 'lang', 'updated_at', 'id'], 'uva_user_lang_updated_id_idx');
            $table->index(['user_id', 'lang', 'favorited', 'updated_at'], 'uva_user_lang_fav_updated_idx');
            $table->index(['user_id', 'lang', 'bookmarked', 'updated_at'], 'uva_user_lang_bmk_updated_idx');
        });
    }

    public function down(): void
    {
        Schema::table('user_verse_actions', function (Blueprint $table) {
            $table->dropIndex('uva_user_lang_updated_id_idx');
            $table->dropIndex('uva_user_lang_fav_updated_idx');
            $table->dropIndex('uva_user_lang_bmk_updated_idx');
        });
    }
};
