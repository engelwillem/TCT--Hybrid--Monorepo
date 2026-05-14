<?php

return [
    'n8n' => [
        'base_url' => env('N8N_BASE_URL', ''),
        'api_key' => env('N8N_API_KEY', ''),
        'timeout_seconds' => (int) env('N8N_TIMEOUT_SECONDS', 20),
        'enabled' => (bool) env('N8N_ENABLED', false),
    ],
    'power_automate' => [
        'base_url' => env('POWER_AUTOMATE_BASE_URL', ''),
        'bearer_token' => env('POWER_AUTOMATE_BEARER_TOKEN', ''),
        'timeout_seconds' => (int) env('POWER_AUTOMATE_TIMEOUT_SECONDS', 20),
        'enabled' => (bool) env('POWER_AUTOMATE_ENABLED', false),
    ],
    'sharepoint' => [
        'site_url' => env('SHAREPOINT_SITE_URL', ''),
        'list_id' => env('SHAREPOINT_LIST_ID', ''),
        'bearer_token' => env('SHAREPOINT_BEARER_TOKEN', ''),
        'timeout_seconds' => (int) env('SHAREPOINT_TIMEOUT_SECONDS', 20),
        'enabled' => (bool) env('SHAREPOINT_ENABLED', false),
    ],
];

