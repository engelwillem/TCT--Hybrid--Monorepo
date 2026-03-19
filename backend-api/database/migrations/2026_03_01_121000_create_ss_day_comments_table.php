<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ss_day_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ss_day_id')->constrained('ss_days')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reply_to_id')->nullable()->constrained('ss_day_comments')->nullOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['ss_day_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ss_day_comments');
    }
};
