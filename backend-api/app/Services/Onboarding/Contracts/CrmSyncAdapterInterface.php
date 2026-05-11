<?php

namespace App\Services\Onboarding\Contracts;

use App\Models\OnboardingLead;

interface CrmSyncAdapterInterface
{
    /**
     * @return array<string, mixed>
     */
    public function syncLead(OnboardingLead $lead): array;
}

