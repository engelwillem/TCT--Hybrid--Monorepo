<?php

namespace App\Services\AI;

use App\Services\VerseHubMentorService;

class VerseHubAIService
{
    public function __construct(
        private readonly VerseHubMentorService $mentorService,
        private readonly AITelemetryService $telemetryService,
    ) {
    }

    public function getGuidedInsights(string $bookCode, int $chapter, int $verse, string $text = ''): array
    {
        return $this->mentorService->getGuidedInsights($bookCode, $chapter, $verse, $text);
    }

    public function getRelationships(string $verseRef): array
    {
        return $this->mentorService->getRelationships($verseRef);
    }

    public function getThemes(string $verseRef): array
    {
        return $this->mentorService->getThemes($verseRef);
    }

    public function getActiveStudyPaths(mixed $user, string $verseRef): array
    {
        return $this->mentorService->getActiveStudyPaths($user, $verseRef);
    }

    public function getDenominationalContext(string $bookCode, int $chapter, int $verse): array
    {
        return $this->mentorService->getDenominationalContext($bookCode, $chapter, $verse);
    }

    /**
     * @param  array<string, mixed>  $verseContext
     * @return array<string, mixed>
     */
    public function ask(string $question, array $verseContext, mixed $user = null, string $assistMode = 'explain_simply'): array
    {
        $result = $this->mentorService->askScriptureGuide(
            question: $question,
            verseContext: $verseContext + ['assist_mode' => $assistMode],
            user: $user
        );

        $grounding = [
            'anchor_ref' => data_get($result, 'scripture_basis.anchor_ref'),
            'anchor_text_excerpt' => data_get($result, 'scripture_basis.anchor_text_excerpt'),
            'related_refs' => data_get($result, 'scripture_basis.related_refs', []),
            'mode' => $assistMode,
            'interpretation_note' => data_get($result, 'interpretation') ? 'interpretive_layer_present' : 'text_focused',
            'grounding_note' => data_get($result, 'grounding_note'),
            'confidence_note' => $result['confidence'] ?? null,
        ];

        $this->telemetryService->record('versehub.ask', [
            'assist_mode' => $assistMode,
            'has_related_refs' => ! empty($grounding['related_refs']),
            'confidence' => $result['confidence'] ?? null,
        ]);

        return $result + ['grounding' => $grounding];
    }
}
