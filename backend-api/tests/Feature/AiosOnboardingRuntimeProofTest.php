<?php

namespace Tests\Feature;

use App\Models\OnboardingEvent;
use App\Models\OnboardingLead;
use App\Models\OnboardingRun;
use App\Services\AI\AIProviderInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AiosOnboardingRuntimeProofTest extends TestCase
{
    use RefreshDatabase;

    public function test_onboarding_intake_route_validates_input(): void
    {
        $this->postJson('/api/v1/onboarding/leads', [
            'full_name' => '',
            'email' => 'not-an-email',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['full_name', 'email']);
    }

    public function test_onboarding_intake_creates_lead_and_run_with_correlation_id(): void
    {
        Queue::fake();

        $this->postJson('/api/v1/onboarding/leads', [
            'source' => 'portfolio_demo',
            'full_name' => 'Runtime Proof Lead',
            'email' => 'runtime.proof@example.com',
            'phone' => '+62000000001',
            'risk_profile' => 'balanced',
            'goals' => ['retirement'],
        ], ['X-Correlation-Id' => 'proof-001'])->assertAccepted()
            ->assertJsonPath('correlation_id', 'proof-001')
            ->assertJsonStructure(['lead_id', 'run_id', 'status', 'current_stage', 'correlation_id']);

        $this->assertDatabaseHas('onboarding_leads', [
            'correlation_id' => 'proof-001',
            'email' => 'runtime.proof@example.com',
        ]);
        $this->assertDatabaseHas('onboarding_runs', ['status' => 'running']);
    }

    public function test_status_endpoint_returns_safe_data_without_sensitive_lead_fields(): void
    {
        $lead = OnboardingLead::query()->create([
            'source' => 'portfolio_demo',
            'full_name' => 'Sensitive Person',
            'email' => 'secret@example.com',
            'phone' => '+62000000002',
            'status' => 'completed',
            'current_stage' => 'completed',
            'correlation_id' => 'safe-status-001',
        ]);
        $run = OnboardingRun::query()->create([
            'onboarding_lead_id' => $lead->id,
            'run_number' => 1,
            'status' => 'completed',
            'started_at' => now()->subMinute(),
            'finished_at' => now(),
        ]);
        OnboardingEvent::query()->create([
            'onboarding_lead_id' => $lead->id,
            'onboarding_run_id' => $run->id,
            'stage' => 'lead_validated',
            'status' => 'success',
            'payload_json' => ['email' => 'se***@example.com', 'has_phone' => true],
            'occurred_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/onboarding/runs/safe-status-001/status')
            ->assertOk()
            ->assertJsonPath('correlation_id', 'safe-status-001')
            ->assertJsonMissing(['full_name' => 'Sensitive Person'])
            ->assertJsonMissing(['email' => 'secret@example.com'])
            ->assertJsonMissing(['phone' => '+62000000002']);

        $payload = $response->json();
        $this->assertArrayNotHasKey('lead', $payload);
        $this->assertArrayNotHasKey('email', $payload['events'][0]['payload']);
    }

    public function test_dashboard_summary_and_recent_runs_are_demo_safe(): void
    {
        $lead = OnboardingLead::query()->create([
            'source' => 'portfolio_demo',
            'full_name' => 'Dashboard Person',
            'email' => 'dashboard@example.com',
            'status' => 'completed',
            'current_stage' => 'completed',
            'correlation_id' => 'dashboard-001',
        ]);
        OnboardingRun::query()->create([
            'onboarding_lead_id' => $lead->id,
            'run_number' => 1,
            'status' => 'completed',
            'started_at' => now()->subSeconds(5),
            'finished_at' => now(),
        ]);

        $this->getJson('/api/v1/onboarding/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('total_leads', 1)
            ->assertJsonPath('limitations.contains_private_lead_data', false);

        $this->getJson('/api/v1/onboarding/dashboard/recent-runs')
            ->assertOk()
            ->assertJsonPath('data.0.lead.correlation_id', 'dashboard-001')
            ->assertJsonMissing(['email' => 'dashboard@example.com'])
            ->assertJsonMissing(['full_name' => 'Dashboard Person']);
    }

    public function test_generic_webhook_adapters_missing_config_do_not_crash_pipeline(): void
    {
        config()->set('ai.provider', 'null');
        config()->set('onboarding.integrations.mode', 'webhook');
        config()->set('onboarding.integrations.crm.webhook_url', null);
        config()->set('onboarding.integrations.calendar.webhook_url', null);
        $this->app->instance(AIProviderInterface::class, new class implements AIProviderInterface {
            public function requestJson(array $messages, array $options = []): array
            {
                return [
                    'request_id' => 'test-aios-proof',
                    'data' => [
                        'summary' => 'Runtime proof summary.',
                        'risk_observation' => 'Balanced.',
                        'next_actions' => ['Review onboarding proof.'],
                    ],
                ];
            }
        });

        $lead = OnboardingLead::query()->create([
            'source' => 'portfolio_demo',
            'full_name' => 'Adapter Proof',
            'email' => 'adapter@example.com',
            'status' => 'pending',
            'current_stage' => 'lead_received',
            'correlation_id' => 'adapter-proof-001',
        ]);
        $run = OnboardingRun::query()->create([
            'onboarding_lead_id' => $lead->id,
            'run_number' => 1,
            'status' => 'running',
            'started_at' => now(),
        ]);

        app(\App\Services\Onboarding\OnboardingPipelineService::class)->processLead($lead->id, $run->id);

        $this->assertDatabaseHas('onboarding_runs', ['id' => $run->id, 'status' => 'completed']);
        $this->assertDatabaseHas('onboarding_events', ['stage' => 'crm_synced', 'status' => 'success']);
        $this->assertDatabaseHas('onboarding_events', ['stage' => 'calendar_event_created', 'status' => 'success']);

        $crmEvent = OnboardingEvent::query()->where('stage', 'crm_synced')->firstOrFail();
        $calendarEvent = OnboardingEvent::query()->where('stage', 'calendar_event_created')->firstOrFail();
        $this->assertSame('skipped', $crmEvent->payload_json['status']);
        $this->assertFalse($crmEvent->payload_json['configured']);
        $this->assertSame('skipped', $calendarEvent->payload_json['status']);
        $this->assertFalse($calendarEvent->payload_json['configured']);
    }

    public function test_simulated_email_step_is_recorded_honestly(): void
    {
        $this->app->instance(AIProviderInterface::class, new class implements AIProviderInterface {
            public function requestJson(array $messages, array $options = []): array
            {
                return [
                    'request_id' => 'test-email-proof',
                    'data' => [
                        'summary' => 'Runtime proof summary.',
                        'risk_observation' => 'Balanced.',
                        'next_actions' => ['Review onboarding proof.'],
                    ],
                ];
            }
        });

        $lead = OnboardingLead::query()->create([
            'source' => 'portfolio_demo',
            'full_name' => 'Email Proof',
            'email' => 'email-proof@example.com',
            'status' => 'pending',
            'current_stage' => 'lead_received',
            'correlation_id' => 'email-proof-001',
        ]);
        $run = OnboardingRun::query()->create([
            'onboarding_lead_id' => $lead->id,
            'run_number' => 1,
            'status' => 'running',
            'started_at' => now(),
        ]);

        app(\App\Services\Onboarding\OnboardingPipelineService::class)->processLead($lead->id, $run->id);

        $event = OnboardingEvent::query()->where('stage', 'welcome_email_sent')->firstOrFail();
        $this->assertSame('mock', $event->payload_json['channel']);
        $this->assertSame('simulated/mock', $event->payload_json['status_label']);
        $this->assertSame('not_sent', $event->payload_json['delivery']);
    }

    public function test_private_onboarding_admin_routes_require_authentication(): void
    {
        $this->getJson('/api/v1/onboarding/leads')->assertUnauthorized();
        $this->getJson('/api/v1/onboarding/logs')->assertUnauthorized();
    }
}