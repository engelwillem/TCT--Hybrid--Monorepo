<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
        Schema::create('data_lifecycle_markers', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type', 60); // table | model | feature
            $table->string('entity_key', 120); // e.g. quarters
            $table->string('status', 40); // active | deprecated | drop_ready | dropped
            $table->text('notes')->nullable();
            $table->timestamp('marked_at')->nullable();
            $table->timestamps();

            $table->unique(['entity_type', 'entity_key']);
            $table->index(['status', 'marked_at']);
        });

        $now = Carbon::now();

        DB::table('data_lifecycle_markers')->upsert([
            [
                'entity_type' => 'table',
                'entity_key' => 'quarters',
                'status' => 'deprecated',
                'notes' => 'Legacy source for /today retired. Kept temporarily for observation window before drop.',
                'marked_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'entity_type' => 'table',
                'entity_key' => 'lessons',
                'status' => 'deprecated',
                'notes' => 'Legacy source for /today retired. Kept temporarily for observation window before drop.',
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
        Schema::dropIfExists('data_lifecycle_markers');
    }
};
