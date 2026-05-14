<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_leads', function (Blueprint $table): void {
            $table->id();
            $table->string('source', 40)->default('web_form');
            $table->string('full_name');
            $table->string('email')->index();
            $table->string('phone', 40)->nullable();
            $table->decimal('annual_income', 18, 2)->nullable();
            $table->string('risk_profile', 30)->nullable();
            $table->json('goals_json')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->string('current_stage', 60)->default('lead_received')->index();
            $table->string('correlation_id', 120)->unique();
            $table->timestamp('last_processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('onboarding_runs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('onboarding_lead_id')->constrained('onboarding_leads')->cascadeOnDelete();
            $table->unsignedInteger('run_number')->default(1);
            $table->string('status', 20)->default('running')->index();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->unique(['onboarding_lead_id', 'run_number'], 'onboarding_runs_lead_run_unique');
        });

        Schema::create('onboarding_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('onboarding_run_id')->constrained('onboarding_runs')->cascadeOnDelete();
            $table->foreignId('onboarding_lead_id')->constrained('onboarding_leads')->cascadeOnDelete();
            $table->string('stage', 60)->index();
            $table->string('status', 20)->index();
            $table->json('payload_json')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->string('error_code', 80)->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('occurred_at')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_events');
        Schema::dropIfExists('onboarding_runs');
        Schema::dropIfExists('onboarding_leads');
    }
};

