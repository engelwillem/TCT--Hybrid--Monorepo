<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('member_post_comments', 'reply_to_comment_id')) {
            return;
        }

        Schema::table('member_post_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('reply_to_comment_id')
                ->nullable()
                ->after('user_id');
        });

        Schema::table('member_post_comments', function (Blueprint $table) {
            $table->index(['member_post_id', 'reply_to_comment_id'], 'member_post_comments_parent_idx');
            $table->foreign('reply_to_comment_id')
                ->references('id')
                ->on('member_post_comments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('member_post_comments', 'reply_to_comment_id')) {
            return;
        }

        Schema::table('member_post_comments', function (Blueprint $table) {
            $table->dropForeign(['reply_to_comment_id']);
            $table->dropIndex('member_post_comments_parent_idx');
            $table->dropColumn('reply_to_comment_id');
        });
    }
};
