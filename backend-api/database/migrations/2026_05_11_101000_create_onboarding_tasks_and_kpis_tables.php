<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_tasks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('onboarding_lead_id')->constrained('onboarding_leads')->cascadeOnDelete();
            $table->string('task_type', 40)->index();
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->string('assignee', 120)->nullable();
            $table->string('status', 20)->default('open')->index();
            $table->timestamps();
        });

        Schema::create('automation_kpis_daily', function (Blueprint $table): void {
            $table->id();
            $table->date('date')->unique();
            $table->unsignedInteger('total_leads')->default(0);
            $table->unsignedInteger('completed_runs')->default(0);
            $table->unsignedInteger('failed_runs')->default(0);
            $table->unsignedInteger('avg_duration_ms')->default(0);
            $table->unsignedInteger('ai_summary_count')->default(0);
            $table->unsignedInteger('email_sent_count')->default(0);
            $table->unsignedInteger('crm_sync_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_kpis_daily');
        Schema::dropIfExists('onboarding_tasks');
    }
};

