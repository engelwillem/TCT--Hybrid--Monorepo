<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('versehub_comments', function (Blueprint $table) {
            $table->id();
            $table->string('verse_lang', 8);
            $table->string('verse_ref', 64);
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reply_to_id')->nullable()->constrained('versehub_comments')->nullOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['verse_lang', 'verse_ref', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('versehub_comments');
    }
};
