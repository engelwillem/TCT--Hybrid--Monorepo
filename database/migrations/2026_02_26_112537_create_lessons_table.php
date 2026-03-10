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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quarter_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('day_number');
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->unsignedInteger('estimated_minutes')->default(8);
            $table->longText('content')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['quarter_id', 'day_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
