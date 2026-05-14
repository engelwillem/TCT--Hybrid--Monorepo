<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_mentor_sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('user_mentor_sessions', 'session_type')) {
                $table->string('session_type', 40)->nullable()->after('insight_type');
            }
            if (! Schema::hasColumn('user_mentor_sessions', 'summary')) {
                $table->text('summary')->nullable()->after('answer_summary');
            }
            if (! Schema::hasColumn('user_mentor_sessions', 'metadata')) {
                $table->json('metadata')->nullable()->after('summary');
            }
            if (! Schema::hasColumn('user_mentor_sessions', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('metadata');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_mentor_sessions', function (Blueprint $table) {
            foreach (['session_type', 'summary', 'metadata', 'is_archived'] as $column) {
                if (Schema::hasColumn('user_mentor_sessions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

