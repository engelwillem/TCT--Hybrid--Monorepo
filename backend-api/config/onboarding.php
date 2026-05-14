<?php

return [
    'integrations' => [
        'mode' => env('ONBOARDING_INTEGRATIONS_MODE', 'mock'),
        'timeout_seconds' => (int) env('ONBOARDING_INTEGRATIONS_TIMEOUT_SECONDS', 20),
        'crm' => [
            'webhook_url' => env('ONBOARDING_CRM_WEBHOOK_URL'),
            'api_token' => env('ONBOARDING_CRM_API_TOKEN'),
        ],
        'calendar' => [
            'webhook_url' => env('ONBOARDING_CALENDAR_WEBHOOK_URL'),
            'api_token' => env('ONBOARDING_CALENDAR_API_TOKEN'),
        ],
    ],
];

