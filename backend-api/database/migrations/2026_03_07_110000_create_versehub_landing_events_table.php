<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('versehub_landing_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('lang', 5)->default('id');
            $table->string('session_id', 64);
            $table->string('persona', 32);
            $table->string('variant', 4);
            $table->string('event_name', 64);
            $table->json('meta')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['lang', 'event_name', 'occurred_at'], 'vh_landing_lang_event_idx');
            $table->index(['session_id', 'occurred_at'], 'vh_landing_session_idx');
            $table->index(['persona', 'variant', 'occurred_at'], 'vh_landing_persona_variant_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('versehub_landing_events');
    }
};
