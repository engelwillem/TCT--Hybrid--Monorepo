<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verse_pastoral_notes', function (Blueprint $table) {
            $table->id();
            $table->string('verse_ref', 40)->index();
            $table->string('lang', 5)->default('id')->index();
            $table->string('theme_slug', 80)->nullable()->index();
            $table->string('tone_slug', 60)->nullable()->index();
            $table->string('audience_scope', 60)->default('all')->index();
            $table->string('language_style', 40)->default('plain')->index();
            $table->text('main_message');
            $table->text('pastoral_angle')->nullable();
            $table->text('application_text');
            $table->text('hope_text')->nullable();
            $table->text('prayer_direction')->nullable();
            $table->text('correction_direction')->nullable();
            $table->text('de_escalation_direction')->nullable();
            $table->unsignedSmallInteger('priority')->default(100)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->index(['verse_ref', 'lang', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verse_pastoral_notes');
    }
};
