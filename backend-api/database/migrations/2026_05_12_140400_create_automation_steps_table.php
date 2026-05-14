<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_steps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('automation_run_id')->constrained('automation_runs')->cascadeOnDelete();
            $table->string('step_key', 100);
            $table->unsignedSmallInteger('step_order')->default(0);
            $table->string('status', 24)->default('pending')->index();
            $table->string('severity', 24)->default('info')->index();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->json('input')->nullable();
            $table->json('output')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['automation_run_id', 'step_key'], 'automation_steps_run_step_unique');
            $table->index(['automation_run_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_steps');
    }
};
