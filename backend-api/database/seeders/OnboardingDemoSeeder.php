<?php

namespace Database\Seeders;

use App\Jobs\Onboarding\ProcessOnboardingLeadJob;
use App\Models\OnboardingLead;
use App\Models\OnboardingRun;
use Illuminate\Database\Seeder;

class OnboardingDemoSeeder extends Seeder
{
    public function run(): void
    {
        $samples = [
            [
                'full_name' => 'John Carter',
                'email' => 'john.carter.demo@example.com',
                'phone' => '628123450001',
                'annual_income' => 180000000,
                'risk_profile' => 'moderate',
                'goals_json' => ['retirement_20y', 'education_fund'],
                'notes' => 'Wants structured monthly portfolio review.',
                'source' => 'api',
                'correlation_id' => 'demo-onb-john-carter',
            ],
            [
                'full_name' => 'Melissa Rivera',
                'email' => 'melissa.rivera.demo@example.com',
                'phone' => '628123450002',
                'annual_income' => 240000000,
                'risk_profile' => 'growth',
                'goals_json' => ['wealth_growth_10y', 'real_estate_down_payment'],
                'notes' => 'Open to higher volatility for long-term growth.',
                'source' => 'web_form',
                'correlation_id' => 'demo-onb-melissa-rivera',
            ],
            [
                'full_name' => 'Daniel Wijaya',
                'email' => 'daniel.wijaya.demo@example.com',
                'phone' => '628123450003',
                'annual_income' => 120000000,
                'risk_profile' => 'conservative',
                'goals_json' => ['emergency_fund', 'capital_preservation'],
                'notes' => 'Prefers low-risk allocation and stable cash flow.',
                'source' => 'import',
                'correlation_id' => 'demo-onb-daniel-wijaya',
            ],
        ];

        foreach ($samples as $payload) {
            $lead = OnboardingLead::query()->updateOrCreate(
                ['correlation_id' => $payload['correlation_id']],
                $payload + [
                    'status' => 'pending',
                    'current_stage' => 'lead_received',
                ]
            );

            $run = OnboardingRun::query()->create([
                'onboarding_lead_id' => $lead->id,
                'run_number' => ((int) OnboardingRun::query()->where('onboarding_lead_id', $lead->id)->max('run_number')) + 1,
                'status' => 'running',
                'started_at' => now(),
            ]);

            ProcessOnboardingLeadJob::dispatch($lead->id, $run->id);
        }
    }
}

