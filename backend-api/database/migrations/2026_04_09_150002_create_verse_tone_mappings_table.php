<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verse_tone_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('tone_slug', 60)->index();
            $table->string('verse_ref', 40)->index();
            $table->string('lang', 5)->default('id');
            $table->unsignedTinyInteger('weight')->default(100);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['tone_slug', 'verse_ref', 'lang']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verse_tone_mappings');
    }
};
