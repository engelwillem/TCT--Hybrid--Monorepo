<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        if (Schema::hasTable('user_lesson_progress')) {
            Schema::drop('user_lesson_progress');
        }

        if (Schema::hasTable('lessons')) {
            Schema::drop('lessons');
        }

        if (Schema::hasTable('quarters')) {
            Schema::drop('quarters');
        }

        if (Schema::hasTable('data_lifecycle_markers')) {
            $now = Carbon::now();
            DB::table('data_lifecycle_markers')
                ->where('entity_type', 'table')
                ->whereIn('entity_key', ['quarters', 'lessons', 'user_lesson_progress'])
                ->update([
                    'status' => 'dropped',
                    'notes' => 'Legacy table removed after cutover.',
                    'marked_at' => $now,
                    'updated_at' => $now,
                ]);
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('quarters', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('cover_image_url')->nullable();
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quarter_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('day_number');
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->unsignedInteger('estimated_minutes')->default(8);
            $table->longText('content')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['quarter_id', 'day_number']);
        });

        Schema::create('user_lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'lesson_id']);
        });

        if (Schema::hasTable('data_lifecycle_markers')) {
            $now = Carbon::now();
            DB::table('data_lifecycle_markers')
                ->where('entity_type', 'table')
                ->whereIn('entity_key', ['quarters', 'lessons', 'user_lesson_progress'])
                ->update([
                    'status' => 'deprecated',
                    'notes' => 'Rollback from dropped status.',
                    'marked_at' => $now,
                    'updated_at' => $now,
                ]);
        }
    }
};
