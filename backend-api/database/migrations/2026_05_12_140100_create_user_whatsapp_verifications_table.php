<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_whatsapp_verifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wa_client_id')->nullable()->constrained('wa_clients')->nullOnDelete();
            $table->string('phone', 40);
            $table->string('normalized_phone', 40)->index();
            $table->string('status', 24)->default('pending')->index();
            $table->string('verification_code_hash', 255)->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->string('last_error', 160)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['normalized_phone', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_whatsapp_verifications');
    }
};
