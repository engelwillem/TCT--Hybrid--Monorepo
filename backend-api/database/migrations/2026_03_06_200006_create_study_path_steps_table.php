<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_path_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('path_id')->constrained('study_paths')->cascadeOnDelete();
            $table->unsignedSmallInteger('step_order')->default(1);
            $table->string('verse_ref', 40);          // e.g. "yoh-3-16"
            $table->string('lang', 5)->default('id');
            $table->string('focus_question', 400)->nullable();  // Reflection prompt for this step
            $table->text('mentor_note')->nullable();            // Context note from editor
            $table->timestamps();

            $table->unique(['path_id', 'step_order']);
            $table->index('verse_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_path_steps');
    }
};
