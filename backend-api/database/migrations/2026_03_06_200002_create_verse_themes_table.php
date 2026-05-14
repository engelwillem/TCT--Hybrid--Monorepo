<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verse_themes', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 60)->unique();           // e.g. "grace", "fear-of-god"
            $table->string('title_id', 100);                // Bahasa Indonesia label
            $table->string('title_en', 100);                // English label
            $table->text('description_id')->nullable();     // Short description (ID)
            $table->text('description_en')->nullable();     // Short description (EN)
            $table->string('color_key', 20)->default('amber'); // UI accent: amber|sky|rose|green|violet
            $table->boolean('is_published')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verse_themes');
    }
};
