<?php

namespace App\Services\AI;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAIResponsesClient implements AIProviderInterface
{
    public function requestJson(array $messages, array $options = []): array
    {
        $apiKey = trim((string) config('ai.openai.api_key'));
        if ($apiKey === '') {
            throw new RuntimeException('OpenAI API key is not configured.');
        }

        $response = Http::acceptJson()
            ->asJson()
            ->timeout(max(5, (int) config('ai.timeout_seconds', 20)))
            ->withToken($apiKey)
            ->post('https://api.openai.com/v1/responses', [
                'model' => (string) ($options['model'] ?? config('ai.openai.model', 'gpt-4o-mini')),
                'temperature' => (float) ($options['temperature'] ?? config('ai.openai.temperature', 0.5)),
                'max_output_tokens' => (int) ($options['max_output_tokens'] ?? config('ai.openai.max_output_tokens', 700)),
                'input' => $messages,
                'text' => isset($options['format']) ? ['format' => $options['format']] : null,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('OpenAI responses request failed with status '.$response->status());
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            throw new RuntimeException('OpenAI responses payload is not JSON object.');
        }

        $outputText = trim((string) Arr::get($payload, 'output_text', ''));
        if ($outputText === '') {
            $outputText = trim((string) Arr::get($payload, 'output.0.content.0.text', ''));
        }
        if ($outputText === '') {
            throw new RuntimeException('OpenAI responses output is empty.');
        }

        $decoded = json_decode($outputText, true);
        if (! is_array($decoded)) {
            throw new RuntimeException('OpenAI responses output is not valid JSON.');
        }

        return [
            'data' => $decoded,
            'request_id' => $response->header('x-request-id'),
        ];
    }
}

