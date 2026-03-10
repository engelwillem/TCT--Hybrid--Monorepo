<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ss_day_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('ss_day_comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('author_name', 80)->nullable()->after('user_id');
        });

        Schema::table('ss_day_comments', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('versehub_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('versehub_comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
            $table->string('author_name', 80)->nullable()->after('user_id');
        });

        Schema::table('versehub_comments', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        // Drop guest comments before making user_id non-nullable again.
        \App\Models\SsDayComment::query()->whereNull('user_id')->delete();

        Schema::table('ss_day_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('author_name');
        });

        Schema::table('ss_day_comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        \App\Models\VersehubComment::query()->whereNull('user_id')->delete();

        Schema::table('versehub_comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('author_name');
        });

        Schema::table('versehub_comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
