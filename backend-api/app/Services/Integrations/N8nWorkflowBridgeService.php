<?php

namespace App\Services\Integrations;

use Illuminate\Support\Arr;

class N8nWorkflowBridgeService
{
    public function __construct(
        private readonly BridgeHttpClient $http,
    ) {}

    public function triggerWorkflow(string $workflowPath, array $payload): array
    {
        $enabled = (bool) config('integration_bridges.n8n.enabled', false);
        if (! $enabled) {
            return ['ok' => false, 'status' => 0, 'message' => 'n8n bridge disabled'];
        }

        $baseUrl = rtrim((string) config('integration_bridges.n8n.base_url', ''), '/');
        $apiKey = trim((string) config('integration_bridges.n8n.api_key', ''));
        if ($baseUrl === '' || $apiKey === '') {
            return ['ok' => false, 'status' => 0, 'message' => 'n8n bridge misconfigured'];
        }

        $url = $baseUrl.'/'.ltrim($workflowPath, '/');
        $timeout = (int) config('integration_bridges.n8n.timeout_seconds', 20);
        $response = $this->http->postJson($url, $payload, [
            'X-N8N-API-KEY' => $apiKey,
        ], $timeout);

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => Arr::wrap($response->json() ?? []),
        ];
    }
}

