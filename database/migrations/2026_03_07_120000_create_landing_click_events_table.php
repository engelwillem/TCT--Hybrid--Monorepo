<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_click_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id', 64);
            $table->string('variant', 4);
            $table->string('event_name', 64);
            $table->string('target', 255)->nullable();
            $table->string('page', 120)->default('/');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['event_name', 'created_at'], 'landing_click_event_idx');
            $table->index(['session_id', 'created_at'], 'landing_click_session_idx');
            $table->index(['variant', 'created_at'], 'landing_click_variant_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_click_events');
    }
};
