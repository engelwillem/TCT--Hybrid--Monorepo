<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_failures', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('automation_event_id')->nullable()->constrained('automation_events')->nullOnDelete();
            $table->string('workflow', 120)->index();
            $table->string('status', 32)->default('failed')->index();
            $table->string('root_cause', 120)->nullable()->index();
            $table->string('idempotency_key', 190)->nullable()->index();
            $table->string('subject_type', 120)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->unsignedInteger('attempt')->default(1);
            $table->text('error_message')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_failures');
    }
};

