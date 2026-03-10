<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('verse_theme_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('theme_slug', 60)->index();
            $table->string('verse_ref', 40)->index();       // e.g. "yoh-3-16"
            $table->string('lang', 5)->default('id');       // "id" | "en"
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['theme_slug', 'verse_ref', 'lang']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verse_theme_mappings');
    }
};
