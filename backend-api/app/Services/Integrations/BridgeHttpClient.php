<?php

namespace App\Services\Integrations;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class BridgeHttpClient
{
    public function postJson(string $url, array $payload, array $headers = [], int $timeoutSeconds = 20): Response
    {
        return Http::retry(3, 250, throw: false)
            ->timeout($timeoutSeconds)
            ->acceptJson()
            ->withHeaders(array_merge([
                'Content-Type' => 'application/json',
            ], $headers))
            ->post($url, $payload);
    }
}

