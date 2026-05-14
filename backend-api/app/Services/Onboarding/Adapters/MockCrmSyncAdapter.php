<?php

namespace App\Services\Onboarding\Adapters;

use App\Models\OnboardingLead;
use App\Services\Onboarding\Contracts\CrmSyncAdapterInterface;

class MockCrmSyncAdapter implements CrmSyncAdapterInterface
{
    public function syncLead(OnboardingLead $lead): array
    {
        return [
            'provider' => 'mock',
            'status_label' => 'simulated/mock',
            'external_reference_id' => 'crm-'.$lead->id.'-'.now()->timestamp,
            'status' => 'ok',
        ];
    }
}

