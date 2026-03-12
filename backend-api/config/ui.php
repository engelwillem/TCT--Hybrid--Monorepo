<?php

return [
    /*
    |--------------------------------------------------------------------------
    | UI / Branding (Client Config)
    |--------------------------------------------------------------------------
    |
    | These values are safe to expose to the frontend (via Inertia shared
    | props). Keep secrets out of this config.
    |
    */

    'community_name' => env('UI_COMMUNITY_NAME', 'The Chosen People'),

    // Short tagline / wordmark
    'tagline' => env('UI_TAGLINE', 'The Chosen People'),

    // Official website domain used for links and footer
    'official_domain' => env('UI_OFFICIAL_DOMAIN', 'https://example.com'),

    // HSL triplets, without the surrounding `hsl(...)`.
    // Example: "86 95% 56%".
    // Neo-blue default (≈ #00A6FF)
    'brand_hsl' => env('UI_BRAND_HSL', '201 100% 50%'),
    'brand_foreground_hsl' => env('UI_BRAND_FOREGROUND_HSL', '0 0% 8%'),

    // Simple admin announcements (prototype).
    // Later we can move this to DB via an Admin panel.
    'announcements' => [
        [
            'id' => 'welcome',
            'title' => 'Welcome Chosen People',
            'body' => 'Welcome to The Choose n Talks! Silahkan cek pesan admin di inbox.',
            'created_at' => now()->toISOString(),
        ],
    ],
];
