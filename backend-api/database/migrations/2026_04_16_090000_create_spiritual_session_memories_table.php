<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spiritual_session_memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('source', 32)->default('renungan');
            $table->string('dominant_emotion', 64)->nullable();
            $table->string('reflection_theme', 64)->nullable();
            $table->string('primary_verse_reference', 120)->nullable();
            $table->text('primary_verse_text')->nullable();
            $table->string('interpretation_focus', 240)->nullable();
            $table->string('pipeline_version', 64)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'source', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spiritual_session_memories');
    }
};

