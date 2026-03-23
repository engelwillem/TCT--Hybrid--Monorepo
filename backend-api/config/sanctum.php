<?php

use Laravel\Sanctum\Sanctum;

$defaultStatefulDomains = array_values(array_filter(array_unique(array_map(
    static fn (?string $value): string => trim((string) $value),
    [
        'localhost',
        'localhost:3000',
        'localhost:9002',
        '127.0.0.1',
        '127.0.0.1:8000',
        '127.0.0.1:9002',
        '::1',
        Sanctum::currentApplicationUrlWithPort(),
        parse_url((string) env('NEXT_PUBLIC_APP_URL', ''), PHP_URL_HOST) ?: '',
        'thechoosentalks.org',
        'www.thechoosentalks.org',
        'api.thechoosentalks.org',
    ],
))));

return [
    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | These domains will receive Laravel's session cookies when the frontend
    | behaves as a first-party SPA. Keep localhost entries for parity, then
    | add the public production hosts via SANCTUM_STATEFUL_DOMAINS.
    |
    */

    'stateful' => array_values(array_filter(array_unique(array_map(
        static fn (?string $value): string => trim((string) $value),
        explode(',', env('SANCTUM_STATEFUL_DOMAINS', implode(',', $defaultStatefulDomains))),
    )))),

    'guard' => ['web'],

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
