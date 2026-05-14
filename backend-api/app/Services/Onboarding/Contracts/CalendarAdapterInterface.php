<?php

namespace App\Services\Onboarding\Contracts;

use App\Models\OnboardingLead;

interface CalendarAdapterInterface
{
    /**
     * @return array<string, mixed>
     */
    public function createEvent(OnboardingLead $lead): array;
}

