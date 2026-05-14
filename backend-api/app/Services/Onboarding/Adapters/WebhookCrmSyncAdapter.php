<?php

namespace App\Services\Onboarding\Adapters;

use App\Models\OnboardingLead;
use App\Services\Onboarding\Contracts\CrmSyncAdapterInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WebhookCrmSyncAdapter implements CrmSyncAdapterInterface
{
    public function syncLead(OnboardingLead $lead): array
    {
        $url = trim((string) config('onboarding.integrations.crm.webhook_url'));
        if ($url === '') {
            return [
                'provider' => 'generic_webhook',
                'status' => 'skipped',
                'configured' => false,
                'message' => 'Generic CRM webhook adapter not configured; skipped safely.',
            ];
        }

        $response = Http::acceptJson()
            ->asJson()
            ->timeout((int) config('onboarding.integrations.timeout_seconds', 20))
            ->withToken((string) config('onboarding.integrations.crm.api_token', ''))
            ->post($url, [
                'lead' => [
                    'id' => $lead->id,
                    'full_name' => $lead->full_name,
                    'email' => $lead->email,
                    'phone' => $lead->phone,
                    'risk_profile' => $lead->risk_profile,
                    'annual_income' => $lead->annual_income,
                    'goals' => $lead->goals_json,
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('CRM sync failed with status '.$response->status());
        }

        $payload = $response->json();

        return [
            'provider' => 'webhook',
            'configured' => true,
            'external_reference_id' => is_array($payload) ? ($payload['id'] ?? $payload['external_id'] ?? null) : null,
            'status' => 'ok',
            'response' => is_array($payload) ? $payload : null,
        ];
    }
}

