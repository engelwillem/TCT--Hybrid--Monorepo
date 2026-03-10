<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bible_verses', function (Blueprint $table) {
            $table->id();

            // Example provider: AYT (Alkitab Yang Terbuka)
            $table->string('provider', 24)->index();

            // Language of the verse text.
            $table->string('lang', 5)->index();

            // Canonical reference parts.
            // NOTE: book_code is the VerseHub native slug code (ID: kej/mzm/yoh/flm..., EN: gen/ps/jhn/phlm...)
            $table->string('book_code', 16)->index();
            $table->unsignedSmallInteger('chapter')->index();
            $table->unsignedSmallInteger('verse')->index();

            // Human reference label (for UI/OG), e.g. "Filemon 1:15".
            $table->string('reference', 96)->nullable();

            // Verse text.
            $table->text('text');

            // Useful for future filtering.
            $table->string('translation_name', 32)->nullable();

            // Unique constraint to prevent duplicates.
            $table->unique([
                'provider',
                'lang',
                'book_code',
                'chapter',
                'verse',
            ], 'bible_verses_provider_lang_ref_unique');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bible_verses');
    }
};
