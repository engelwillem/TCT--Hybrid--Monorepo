<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;

class RichContentSanitizer
{
    public function __construct(
        private readonly HtmlSanitizerInterface $sanitizer,
    ) {}

    public function sanitize(?string $html): ?string
    {
        $value = trim((string) $html);

        if ($value === '') {
            return null;
        }

        $sanitized = trim($this->sanitizer->sanitize($value));

        return $sanitized === '' ? null : $sanitized;
    }
}
