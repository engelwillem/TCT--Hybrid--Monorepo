<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verse_tones', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 60)->unique();
            $table->string('title_id', 120);
            $table->string('title_en', 120);
            $table->text('description_id')->nullable();
            $table->text('description_en')->nullable();
            $table->boolean('is_published')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verse_tones');
    }
};
