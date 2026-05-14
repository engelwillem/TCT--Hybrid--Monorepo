<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | By default we keep this tight (no allowed origins unless explicitly set)
    | because this app is primarily a same-origin Inertia/Laravel web app.
    |
    | If you expose API endpoints to other origins, set:
    |   CORS_ALLOWED_ORIGINS=https://example.com,https://app.example.com
    |
    */

    'paths' => ['api/*', 'up'],

    'allowed_methods' => ['*'],

    // Comma-separated allowlist in env. Empty array means: do not allow cross-origin.
    'allowed_origins' => array_values(array_filter(array_map(
        static fn (string $o): string => trim($o),
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => (bool) env('CORS_SUPPORTS_CREDENTIALS', false),
];
