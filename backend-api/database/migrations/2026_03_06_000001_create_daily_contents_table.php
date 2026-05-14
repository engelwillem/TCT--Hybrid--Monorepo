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
        Schema::create('daily_contents', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('content_type'); // today_verse, quote_of_day, reflection_prompt
            $table->json('payload')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['date', 'content_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_contents');
    }
};
