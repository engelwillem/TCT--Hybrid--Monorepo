<?php

namespace App\Services\VerseHub;

use Illuminate\Support\Str;

class VerseHubMentorOgCopyBuilder
{
    /**
     * @return array{title: string, subtitle: string}
     */
    public function build(string $reference, ?string $question, ?string $summary): array
    {
        $normalizedQuestion = trim((string) $question);
        $normalizedSummary = trim((string) $summary);

        $normalizedQuestion = Str::limit(
            preg_replace('/\s+/', ' ', $normalizedQuestion) ?? $normalizedQuestion,
            90,
            '…'
        );
        $normalizedSummary = Str::limit(
            preg_replace('/\s+/', ' ', $normalizedSummary) ?? $normalizedSummary,
            190,
            '…'
        );

        $title = $normalizedQuestion !== ''
            ? "Ask the Bible: {$normalizedQuestion}"
            : "Ask the Bible — {$reference}";
        $subtitle = $normalizedSummary !== ''
            ? $normalizedSummary
            : "Scripture Guide membantu studi berbasis {$reference} secara transparan, tenang, dan berpusat pada teks Alkitab.";

        return [
            'title' => $title,
            'subtitle' => $subtitle,
        ];
    }
}
