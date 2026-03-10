<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_verse_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('lang', 8)->default('id');
            $table->string('book_code', 24);
            $table->unsignedSmallInteger('chapter');
            $table->unsignedSmallInteger('verse');
            $table->boolean('favorited')->default(false);
            $table->boolean('bookmarked')->default(false);
            $table->boolean('highlighted')->default(false);
            $table->string('highlight_color', 16)->nullable();
            $table->text('note_text')->nullable();
            $table->timestamps();

            $table->unique(
                ['user_id', 'lang', 'book_code', 'chapter', 'verse'],
                'user_verse_actions_unique'
            );
            $table->index(['lang', 'book_code', 'chapter'], 'user_verse_actions_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_verse_actions');
    }
};

