<?php

namespace App\Services\Onboarding\Adapters;

use App\Models\OnboardingLead;
use App\Services\Onboarding\Contracts\CalendarAdapterInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WebhookCalendarAdapter implements CalendarAdapterInterface
{
    public function createEvent(OnboardingLead $lead): array
    {
        $url = trim((string) config('onboarding.integrations.calendar.webhook_url'));
        if ($url === '') {
            throw new RuntimeException('Calendar webhook URL is not configured.');
        }

        $startAt = now()->addDay()->startOfHour();
        $response = Http::acceptJson()
            ->asJson()
            ->timeout((int) config('onboarding.integrations.timeout_seconds', 20))
            ->withToken((string) config('onboarding.integrations.calendar.api_token', ''))
            ->post($url, [
                'title' => 'Client discovery call - '.$lead->full_name,
                'description' => 'Initial onboarding advisory call',
                'start_at' => $startAt->toIso8601String(),
                'duration_minutes' => 30,
                'attendees' => array_values(array_filter([$lead->email])),
                'metadata' => [
                    'lead_id' => $lead->id,
                    'correlation_id' => $lead->correlation_id,
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Calendar event create failed with status '.$response->status());
        }

        $payload = $response->json();

        return [
            'provider' => 'webhook',
            'event_id' => is_array($payload) ? ($payload['id'] ?? $payload['event_id'] ?? null) : null,
            'start_at' => $startAt->toIso8601String(),
            'status' => 'ok',
            'response' => is_array($payload) ? $payload : null,
        ];
    }
}

