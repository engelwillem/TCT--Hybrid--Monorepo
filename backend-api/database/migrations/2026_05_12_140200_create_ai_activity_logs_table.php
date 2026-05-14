<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ai_activity_logs')) {
            return;
        }

        Schema::create('ai_activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event', 100)->index();
            $table->string('surface', 60)->nullable()->index();
            $table->string('workflow_key', 100)->nullable()->index();
            $table->string('provider', 40)->nullable();
            $table->string('model', 80)->nullable();
            $table->string('status', 24)->default('success')->index();
            $table->string('severity', 24)->default('info')->index();
            $table->string('request_id', 120)->nullable()->index();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->unsignedInteger('total_tokens')->nullable();
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('occurred_at')->useCurrent()->index();
            $table->timestamps();

            $table->index(['workflow_key', 'status', 'occurred_at'], 'ai_activity_workflow_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_activity_logs');
    }
};
