<?php

namespace App\Services\AI;

interface AIProviderInterface
{
    /**
     * @param  array<int, array<string, mixed>>  $messages
     * @param  array<string, mixed>  $options
     * @return array{data: array<string, mixed>, request_id: string|null}
     */
    public function requestJson(array $messages, array $options = []): array;
}

