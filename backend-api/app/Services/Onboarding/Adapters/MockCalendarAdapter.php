<?php

namespace App\Services\Onboarding\Adapters;

use App\Models\OnboardingLead;
use App\Services\Onboarding\Contracts\CalendarAdapterInterface;

class MockCalendarAdapter implements CalendarAdapterInterface
{
    public function createEvent(OnboardingLead $lead): array
    {
        return [
            'provider' => 'mock',
            'event_id' => 'cal-'.$lead->id.'-'.now()->timestamp,
            'start_at' => now()->addDay()->startOfHour()->toIso8601String(),
            'status' => 'ok',
        ];
    }
}

