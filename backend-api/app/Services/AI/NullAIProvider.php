<?php

namespace App\Services\AI;

use RuntimeException;

class NullAIProvider implements AIProviderInterface
{
    public function requestJson(array $messages, array $options = []): array
    {
        throw new RuntimeException('AI provider is disabled or unavailable.');
    }
}

