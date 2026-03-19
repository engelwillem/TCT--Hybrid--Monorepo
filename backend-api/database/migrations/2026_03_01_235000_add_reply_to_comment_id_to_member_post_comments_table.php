<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_post_comments', function (Blueprint $table) {
            if (! Schema::hasColumn('member_post_comments', 'reply_to_comment_id')) {
                $table->foreignId('reply_to_comment_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('member_post_comments')
                    ->nullOnDelete();
                $table->index(['member_post_id', 'reply_to_comment_id'], 'member_post_comments_parent_idx');
            }
        });
    }

    public function down(): void
    {
        Schema::table('member_post_comments', function (Blueprint $table) {
            if (Schema::hasColumn('member_post_comments', 'reply_to_comment_id')) {
                $table->dropIndex('member_post_comments_parent_idx');
                $table->dropConstrainedForeignId('reply_to_comment_id');
            }
        });
    }
};
