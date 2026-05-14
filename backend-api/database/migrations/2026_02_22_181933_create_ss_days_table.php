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
        Schema::create('ss_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('ss_lessons')->cascadeOnDelete();

            $table->string('day_key'); // sat,sun,mon,tue,wed,thu,fri
            $table->date('date');

            $table->string('title')->nullable();
            $table->longText('content')->nullable();
            $table->string('status')->default('draft'); // draft|published

            $table->unique(['lesson_id', 'day_key']);
            $table->unique(['lesson_id', 'date']);
            $table->index(['date', 'status']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ss_days');
    }
};
