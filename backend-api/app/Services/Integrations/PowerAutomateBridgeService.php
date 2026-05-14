<?php

namespace App\Services\Integrations;

use Illuminate\Support\Arr;

class PowerAutomateBridgeService
{
    public function __construct(
        private readonly BridgeHttpClient $http,
    ) {}

    public function dispatchFlow(string $flowPath, array $payload): array
    {
        $enabled = (bool) config('integration_bridges.power_automate.enabled', false);
        if (! $enabled) {
            return ['ok' => false, 'status' => 0, 'message' => 'power automate bridge disabled'];
        }

        $baseUrl = rtrim((string) config('integration_bridges.power_automate.base_url', ''), '/');
        $token = trim((string) config('integration_bridges.power_automate.bearer_token', ''));
        if ($baseUrl === '' || $token === '') {
            return ['ok' => false, 'status' => 0, 'message' => 'power automate bridge misconfigured'];
        }

        $url = $baseUrl.'/'.ltrim($flowPath, '/');
        $timeout = (int) config('integration_bridges.power_automate.timeout_seconds', 20);
        $response = $this->http->postJson($url, $payload, [
            'Authorization' => 'Bearer '.$token,
        ], $timeout);

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => Arr::wrap($response->json() ?? []),
        ];
    }
}

