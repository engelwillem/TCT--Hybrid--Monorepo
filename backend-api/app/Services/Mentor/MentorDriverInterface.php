<?php

namespace App\Services\Mentor;

interface MentorDriverInterface
{
    /**
     * Return guided insights for a single verse.
     *
     * @param  string  $bookCode  e.g. "yoh"
     * @param  string  $text  The verse text for context
     * @return array{
     *   reflection_questions: string[],
     *   theme_connections: string[],
     *   historical_context: string|null
     * }
     */
    public function getInsights(
        string $bookCode,
        int $chapter,
        int $verse,
        string $text = ''
    ): array;

    /**
     * Answer a free-text question about a specific verse.
     *
     * @param  array  $verseContext  ['ref' => ..., 'text' => ..., 'book' => ..., 'chapter' => ..., 'verse' => ...]
     * @return array{
     *   answer: string,
     *   related_refs: string[],
     *   confidence: string  // "scripture_based" | "interpretive" | "uncertain"
     * }
     */
    public function answerQuestion(string $question, array $verseContext): array;
}
