<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_mentor_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('verse_ref', 40)->index();       // e.g. "yoh-3-16"
            $table->string('lang', 5)->default('id');
            $table->string('question', 500)->nullable();    // Free-text question asked
            $table->text('answer_summary')->nullable();     // Summary of what was returned
            $table->string('insight_type', 40)->nullable(); // "reflection"|"context"|"ask"
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_mentor_sessions');
    }
};
