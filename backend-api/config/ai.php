<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Core AI Provider
    |--------------------------------------------------------------------------
    | Central provider configuration for all AI surfaces.
    | Keep API key server-side only. Never expose via frontend.
    */
    'provider' => env('AI_PROVIDER', 'openai'),
    'fail_soft' => (bool) env('AI_FAIL_SOFT', true),

    'timeout_seconds' => (int) env('AI_TIMEOUT_SECONDS', 20),

    /*
    |--------------------------------------------------------------------------
    | Surface Drivers
    |--------------------------------------------------------------------------
    | Keep backend orchestration centralized while allowing gradual rollout
    | per product surface.
    */
    'drivers' => [
        'renungan' => env('RENUNGAN_MENTOR_DRIVER', 'template'),
        'versehub' => env('VERSEHUB_MENTOR_DRIVER', 'template'),
        'community' => env('COMMUNITY_AI_DRIVER', 'openai'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'temperature' => (float) env('OPENAI_TEMPERATURE', 0.5),
        'max_output_tokens' => (int) env('OPENAI_MAX_OUTPUT_TOKENS', 700),
    ],

    'cache' => [
        'enabled' => (bool) env('AI_CACHE_ENABLED', true),
        'ttl_seconds' => (int) env('AI_CACHE_TTL_SECONDS', 600),
    ],

    'telemetry' => [
        'log_channel' => env('AI_TELEMETRY_LOG_CHANNEL'),
        'persist' => (bool) env('AI_TELEMETRY_PERSIST', false),
    ],
];
