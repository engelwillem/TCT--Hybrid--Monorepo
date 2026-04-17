<?php

namespace App\Services\Renungan;

use Illuminate\Support\Str;

class RenunganSearchTermBuilder
{
    /**
     * @param  array<string, mixed>  $analysis
     * @param  array<string, array<string, mixed>>  $themeProfiles
     * @param  array<int, string>  $stopWords
     * @return array<int, string>
     */
    public function build(string $text, array $analysis, array $themeProfiles, array $stopWords): array
    {
        $normalized = (string) Str::of(Str::lower($text))
            ->replaceMatches('/[^a-z0-9\s]/', ' ')
            ->replaceMatches('/\s+/', ' ')
            ->trim();

        $tokens = collect(explode(' ', $normalized))
            ->filter(fn (string $token) => strlen($token) >= 3)
            ->reject(fn (string $token) => in_array($token, $stopWords, true))
            ->take(12)
            ->values()
            ->all();

        $primaryTheme = (string) ($analysis['primary_theme'] ?? 'direction');
        $secondaryThemes = (array) ($analysis['secondary_themes'] ?? []);
        $primaryEmotion = (string) ($analysis['primary_emotion'] ?? 'confused');
        $intent = (string) ($analysis['intent'] ?? 'guidance');
        $contextFlags = (array) ($analysis['context_flags'] ?? []);

        $themeTerms = $themeProfiles[$primaryTheme]['verse_hints'] ?? ['percaya', 'pengharapan'];
        $secondaryTerms = collect($secondaryThemes)
            ->flatMap(fn (string $theme) => $themeProfiles[$theme]['verse_hints'] ?? [])
            ->take(4)
            ->values()
            ->all();

        $emotionHints = [
            'positive' => ['sukacita', 'bersyukur', 'pujilah'],
            'tender' => ['menyertai', 'pelihara', 'dekat'],
            'fearful' => ['damai', 'tenang', 'jangan takut'],
            'exhausted' => ['kekuatan', 'istirahat', 'ditopang'],
            'guilty' => ['ampuni', 'anugerah', 'dipulihkan'],
            'confused' => ['hikmat', 'tuntun', 'jalan'],
            'angry' => ['lambat marah', 'lemah lembut', 'damai'],
            'hostile' => ['jangan membalas', 'jaga lidah', 'damai'],
            'resentful' => ['kasih', 'cukup', 'syukur'],
            'sad' => ['penghiburan', 'dekat', 'air mata'],
            'hopeful' => ['pengharapan', 'setia', 'janji'],
        ][$primaryEmotion] ?? ['percaya', 'setia'];

        $intentHints = [
            'express_gratitude' => ['puji', 'syukur', 'kemuliaan'],
            'seek_comfort' => ['penghiburan', 'dekat', 'menyertai'],
            'confess' => ['pemulihan', 'pengampunan', 'damai'],
            'lament' => ['ratap', 'penghiburan', 'damai'],
            'process_anger' => ['lambat marah', 'kendali diri', 'damai'],
            'seek_reconciliation' => ['mengampuni', 'damai', 'kasih'],
            'seek_release' => ['lepaskan', 'damai', 'pulih'],
            'seek_peace' => ['damai', 'tenang', 'percaya'],
            'guidance' => ['hikmat', 'tuntunan', 'arah'],
            'surrender_burden' => ['serahkan', 'percaya', 'damai'],
        ][$intent] ?? ['percaya', 'pengharapan'];

        $contextTerms = [];
        if (($contextFlags['has_family_terms'] ?? false) && ($contextFlags['has_longing_terms'] ?? false)) {
            $contextTerms = ['keluarga', 'pelihara', 'lindungi', 'menyertai'];
        } elseif (
            ($contextFlags['has_ministry_terms'] ?? false)
            || ($contextFlags['has_church_hurt_terms'] ?? false)
            || ($contextFlags['has_exploitation_terms'] ?? false)
            || ($contextFlags['has_authority_wound_terms'] ?? false)
        ) {
            $contextTerms = ['hikmat', 'pulihkan', 'teguhkan', 'damai', 'kebenaran', 'jangan tawar hati'];
        } elseif (($contextFlags['has_harm_terms'] ?? false) || ($contextFlags['has_anger_terms'] ?? false)) {
            $contextTerms = ['lambat marah', 'jaga lidah', 'jangan membalas', 'damai'];
        } elseif (($contextFlags['has_conflict_terms'] ?? false)) {
            $contextTerms = ['kasih', 'damai', 'mengampuni'];
        }

        return collect(array_merge($tokens, $themeTerms, $secondaryTerms, $emotionHints, $intentHints, $contextTerms))
            ->map(fn (string $term) => trim($term))
            ->filter()
            ->unique()
            ->take(22)
            ->values()
            ->all();
    }
}
