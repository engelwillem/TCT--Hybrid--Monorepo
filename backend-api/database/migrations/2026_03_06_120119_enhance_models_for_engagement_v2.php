<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Enhance Users Table
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_system')->default(false)->after('is_it');
            $table->string('system_type')->nullable()->after('is_system');
        });

        // 2. Enhance Daily Contents Table
        Schema::table('daily_contents', function (Blueprint $table) {
            $table->string('source_type')->default('official')->after('payload');
            $table->string('review_status')->default('approved')->after('source_type');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete()->after('review_status');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
        });

        // 3. Enhance Member Posts Table
        Schema::table('member_posts', function (Blueprint $table) {
            $table->string('source_type')->default('human')->after('type');
            $table->boolean('is_featured')->default(false)->after('metadata');
            $table->foreignId('daily_content_id')->nullable()->constrained('daily_contents')->nullOnDelete()->after('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_posts', function (Blueprint $table) {
            $table->dropForeign(['daily_content_id']);
            $table->dropColumn(['source_type', 'is_featured', 'daily_content_id']);
        });

        Schema::table('daily_contents', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['source_type', 'review_status', 'reviewed_by', 'reviewed_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_system', 'system_type']);
        });
    }
};
