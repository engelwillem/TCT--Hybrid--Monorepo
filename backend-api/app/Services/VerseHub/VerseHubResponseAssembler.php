<?php

namespace App\Services\VerseHub;

use Illuminate\Support\Str;

class VerseHubResponseAssembler
{
    /**
     * @param  array<string, mixed>  $verse
     * @return array<string, mixed>
     */
    public function buildReaderPayload(
        string $lang,
        string $ref,
        string $query,
        array $verse,
        string $ogImageUrl,
        string $canonicalUrl
    ): array {
        return [
            'lang' => $lang,
            'ref' => $ref,
            'query' => $query,
            'reference' => $verse['reference'] ?? Str::upper($ref),
            'text' => trim((string) ($verse['text'] ?? '')),
            'translation_name' => $verse['translation_name'] ?? null,
            'provider' => $verse['provider'] ?? null,
            'og_image_url' => $ogImageUrl,
            'canonical_url' => $canonicalUrl,
        ];
    }

    /**
     * @param  array<string, mixed>  $insights
     * @return array<string, mixed>
     */
    public function buildMentorInsightsPayload(
        string $ref,
        string $query,
        string $mentorLabel,
        array $insights,
        mixed $relationships,
        mixed $themes,
        mixed $activeStudyPaths,
        mixed $denominationalContext
    ): array {
        return [
            'ref' => $ref,
            'query' => $query,
            'mentor_label' => $mentorLabel,
            'insights' => $insights,
            'relationships' => $relationships,
            'themes' => $themes,
            'active_study_paths' => $activeStudyPaths,
            'denominational_context' => $denominationalContext,
        ];
    }
}
