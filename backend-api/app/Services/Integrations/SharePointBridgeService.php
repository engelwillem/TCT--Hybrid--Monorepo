<?php

namespace App\Services\Integrations;

use Illuminate\Support\Arr;

class SharePointBridgeService
{
    public function __construct(
        private readonly BridgeHttpClient $http,
    ) {}

    public function createListItem(array $fields): array
    {
        $enabled = (bool) config('integration_bridges.sharepoint.enabled', false);
        if (! $enabled) {
            return ['ok' => false, 'status' => 0, 'message' => 'sharepoint bridge disabled'];
        }

        $siteUrl = rtrim((string) config('integration_bridges.sharepoint.site_url', ''), '/');
        $listId = trim((string) config('integration_bridges.sharepoint.list_id', ''));
        $token = trim((string) config('integration_bridges.sharepoint.bearer_token', ''));
        if ($siteUrl === '' || $listId === '' || $token === '') {
            return ['ok' => false, 'status' => 0, 'message' => 'sharepoint bridge misconfigured'];
        }

        $url = $siteUrl."/lists/{$listId}/items";
        $timeout = (int) config('integration_bridges.sharepoint.timeout_seconds', 20);
        $payload = ['fields' => $fields];
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

