<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('study_paths', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('title_id', 120);
            $table->string('title_en', 120);
            $table->text('description_id')->nullable();
            $table->text('description_en')->nullable();
            $table->string('cover_color', 20)->default('amber');   // UI accent
            $table->enum('difficulty', ['beginner', 'intermediate', 'deep'])->default('beginner');
            $table->unsignedSmallInteger('estimated_minutes')->default(10);
            $table->boolean('is_published')->default(false)->index();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_paths');
    }
};
