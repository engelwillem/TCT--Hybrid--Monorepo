<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_runs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('workflow_key', 100)->index();
            $table->string('workflow_version', 40)->nullable();
            $table->string('status', 24)->default('pending')->index();
            $table->string('severity', 24)->default('info')->index();
            $table->string('correlation_id', 120)->nullable()->unique();
            $table->nullableMorphs('subject');
            $table->timestamp('queued_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->json('input')->nullable();
            $table->json('output')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['workflow_key', 'status', 'created_at'], 'automation_runs_workflow_status_idx');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_runs');
    }
};
