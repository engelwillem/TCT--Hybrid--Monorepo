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
        Schema::create('member_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('member_post');

            $table->text('text')->nullable();
            $table->string('image_path')->nullable();
            $table->string('thumb_path')->nullable();

            $table->dateTime('expires_at')->nullable();
            $table->dateTime('hidden_at')->nullable();
            $table->unsignedBigInteger('hidden_by')->nullable();
            $table->timestamps();

            $table->index(['type', 'expires_at', 'hidden_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_posts');
    }
};
