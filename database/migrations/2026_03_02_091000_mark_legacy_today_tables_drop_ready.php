<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('data_lifecycle_markers')) {
            return;
        }

        $now = Carbon::now();

        DB::table('data_lifecycle_markers')->upsert([
            [
                'entity_type' => 'table',
                'entity_key' => 'quarters',
                'status' => 'drop_ready',
                'notes' => 'Cutover approved. Legacy table scheduled for drop.',
                'marked_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'entity_type' => 'table',
                'entity_key' => 'lessons',
                'status' => 'drop_ready',
                'notes' => 'Cutover approved. Legacy table scheduled for drop.',
                'marked_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'entity_type' => 'table',
                'entity_key' => 'user_lesson_progress',
                'status' => 'drop_ready',
                'notes' => 'Cutover approved. Legacy table scheduled for drop.',
                'marked_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ], ['entity_type', 'entity_key'], ['status', 'notes', 'marked_at', 'updated_at']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('data_lifecycle_markers')) {
            return;
        }

        $now = Carbon::now();

        DB::table('data_lifecycle_markers')
            ->where('entity_type', 'table')
            ->whereIn('entity_key', ['quarters', 'lessons', 'user_lesson_progress'])
            ->update([
                'status' => 'deprecated',
                'notes' => 'Rollback from drop_ready.',
                'marked_at' => $now,
                'updated_at' => $now,
            ]);
    }
};

