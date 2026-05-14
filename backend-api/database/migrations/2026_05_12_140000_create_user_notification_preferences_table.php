<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_notification_preferences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('event_key', 80)->default('global');
            $table->string('channel', 24);
            $table->boolean('enabled')->default(true);
            $table->string('timezone', 64)->nullable();
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'event_key', 'channel'], 'user_notification_preferences_unique');
            $table->index(['user_id', 'enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notification_preferences');
    }
};
