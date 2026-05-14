<?php

namespace App\Jobs\Onboarding;

use App\Models\OnboardingLead;
use App\Models\OnboardingRun;
use App\Services\Onboarding\OnboardingPipelineService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessOnboardingLeadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly int $leadId,
        public readonly ?int $runId = null,
    ) {
        $this->onQueue('default');
    }

    public function handle(OnboardingPipelineService $pipeline): void
    {
        try {
            $pipeline->processLead($this->leadId, $this->runId);
        } catch (\Throwable $throwable) {
            $lead = OnboardingLead::query()->find($this->leadId);
            $run = $this->runId !== null
                ? OnboardingRun::query()->find($this->runId)
                : OnboardingRun::query()->where('onboarding_lead_id', $this->leadId)->latest('id')->first();

            if ($lead && $run) {
                $pipeline->failRun($lead, $run, 'failed', 'PIPELINE_UNEXPECTED_ERROR', $throwable->getMessage());
            }

            Log::error('onboarding.pipeline.failed', [
                'lead_id' => $this->leadId,
                'run_id' => $this->runId,
                'error' => $throwable->getMessage(),
            ]);

            throw $throwable;
        }
    }
}

