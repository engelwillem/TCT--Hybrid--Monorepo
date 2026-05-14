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
        Schema::create('ss_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quarter_id')->constrained('ss_quarters')->cascadeOnDelete();

            $table->unsignedTinyInteger('lesson_number'); // 1..13
            $table->string('title')->nullable();

            $table->date('start_date');
            $table->date('end_date');

            $table->unique(['quarter_id', 'lesson_number']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ss_lessons');
    }
};
