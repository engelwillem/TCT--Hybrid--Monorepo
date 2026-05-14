<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_events', function (Blueprint $table): void {
            $table->id();
            $table->string('workflow', 120);
            $table->string('trigger_source', 120)->nullable();
            $table->string('status', 32)->index();
            $table->string('channel', 32)->nullable();
            $table->string('intent', 120)->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->string('recommended_action', 120)->nullable();
            $table->string('idempotency_key', 190)->nullable()->index();
            $table->string('correlation_id', 120)->nullable()->index();
            $table->string('subject_type', 120)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('attempt')->default(1);
            $table->unsignedInteger('duration_ms')->nullable();
            $table->boolean('available_for_retry')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->json('decision_payload')->nullable();
            $table->json('action_payload')->nullable();
            $table->json('result_payload')->nullable();
            $table->timestamps();

            $table->index(['workflow', 'created_at']);
            $table->index(['workflow', 'status', 'created_at']);
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_events');
    }
};

