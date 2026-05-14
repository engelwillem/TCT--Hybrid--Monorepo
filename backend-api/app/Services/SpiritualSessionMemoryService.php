<?php

namespace App\Services;

use App\Models\SpiritualSessionMemory;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SpiritualSessionMemoryService
{
    private const DEFAULT_SOURCE = 'renungan';
    private const KEEP_RECENT_LIMIT = 60;
    private const HIGHLIGHT_WINDOW_DAYS = 7;

    /**
     * @param  array<string, mixed>  $context
     */
    public function rememberFromRenungan(User $user, array $context): void
    {
        SpiritualSessionMemory::query()->create([
            'user_id' => $user->id,
            'source' => self::DEFAULT_SOURCE,
            'dominant_emotion' => $this->trimNullable($context['dominant_emotion'] ?? null, 64),
            'reflection_theme' => $this->trimNullable($context['reflection_theme'] ?? null, 64),
            'primary_verse_reference' => $this->trimNullable($context['primary_verse_reference'] ?? null, 120),
            'primary_verse_text' => $this->trimNullable($context['primary_verse_text'] ?? null),
            'interpretation_focus' => $this->trimNullable($context['interpretation_focus'] ?? null, 240),
            'pipeline_version' => $this->trimNullable($context['pipeline_version'] ?? null, 64),
            'meta' => $this->safeMeta($context['meta'] ?? null),
        ]);

        $this->pruneOldEntries($user->id);
    }

    /**
     * @return array<string, mixed>
     */
    public function getSevenDayHighlights(User $user, ?CarbonInterface $now = null): array
    {
        $cursor = ($now ?: now())->copy()->timezone((string) config('app.timezone', 'UTC'));
        $from = $cursor->copy()->subDays(self::HIGHLIGHT_WINDOW_DAYS);

        /** @var Collection<int, SpiritualSessionMemory> $entries */
        $entries = SpiritualSessionMemory::query()
            ->where('user_id', $user->id)
            ->where('source', self::DEFAULT_SOURCE)
            ->where('created_at', '>=', $from)
            ->orderByDesc('created_at')
            ->limit(self::KEEP_RECENT_LIMIT)
            ->get();

        if ($entries->isEmpty()) {
            return [
                'window_days' => self::HIGHLIGHT_WINDOW_DAYS,
                'session_count' => 0,
                'has_data' => false,
                'summary' => null,
                'latest_session_at' => null,
                'top_emotion' => null,
                'top_theme' => null,
                'top_verse_reference' => null,
            ];
        }

        $emotionCounts = $this->countValues($entries, 'dominant_emotion');
        $themeCounts = $this->countValues($entries, 'reflection_theme');
        $verseCounts = $this->countValues($entries, 'primary_verse_reference');

        $topEmotion = $this->topKey($emotionCounts);
        $topTheme = $this->topKey($themeCounts);
        $topVerse = $this->topKey($verseCounts);

        return [
            'window_days' => self::HIGHLIGHT_WINDOW_DAYS,
            'session_count' => $entries->count(),
            'has_data' => true,
            'summary' => $this->buildSummary($entries->count(), $topEmotion, $topTheme, $topVerse),
            'latest_session_at' => optional($entries->first()?->created_at)->toIso8601String(),
            'top_emotion' => $topEmotion,
            'top_theme' => $topTheme,
            'top_verse_reference' => $topVerse,
        ];
    }

    private function pruneOldEntries(int $userId): void
    {
        $idsToKeep = SpiritualSessionMemory::query()
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->limit(self::KEEP_RECENT_LIMIT)
            ->pluck('id')
            ->all();

        if ($idsToKeep === []) {
            return;
        }

        SpiritualSessionMemory::query()
            ->where('user_id', $userId)
            ->whereNotIn('id', $idsToKeep)
            ->delete();
    }

    /**
     * @return array<string, int>
     */
    private function countValues(Collection $entries, string $key): array
    {
        /** @var array<string, int> $counts */
        $counts = $entries
            ->map(function (SpiritualSessionMemory $entry) use ($key): ?string {
                $value = $entry->{$key} ?? null;
                if (! is_string($value)) {
                    return null;
                }
                $normalized = trim(Str::lower($value));
                return $normalized !== '' ? $normalized : null;
            })
            ->filter()
            ->countBy()
            ->all();

        return $counts;
    }

    /**
     * @param  array<string, int>  $counts
     */
    private function topKey(array $counts): ?string
    {
        if ($counts === []) {
            return null;
        }
        arsort($counts);
        $key = array_key_first($counts);
        return is_string($key) && $key !== '' ? $key : null;
    }

    private function buildSummary(int $sessionCount, ?string $topEmotion, ?string $topTheme, ?string $topVerse): string
    {
        $emotionPart = $topEmotion
            ? 'kamu sering membawa emosi '.Str::lower($topEmotion)
            : 'kamu terus setia membawa isi hati dalam doa';
        $themePart = $topTheme
            ? 'dengan tema '.Str::lower($topTheme)
            : 'dalam pergumulan sehari-hari';
        $versePart = $topVerse
            ? "Ayat yang paling sering muncul mengarah ke {$topVerse}."
            : 'Setiap sesi tetap meneguhkan langkah kecilmu bersama Tuhan.';

        return "Dalam 7 hari terakhir ({$sessionCount} sesi), {$emotionPart} {$themePart}. {$versePart}";
    }

    private function trimNullable(mixed $value, ?int $limit = null): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }
        $text = trim((string) $value);
        if ($text === '') {
            return null;
        }
        if ($limit !== null) {
            return Str::limit($text, $limit, '');
        }
        return $text;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function safeMeta(mixed $meta): ?array
    {
        if (! is_array($meta)) {
            return null;
        }

        $filtered = [];
        foreach ($meta as $key => $value) {
            if (! is_string($key)) {
                continue;
            }
            if (in_array($key, ['request_id', 'driver', 'used_fallback', 'response_mode'], true)) {
                $filtered[$key] = $value;
            }
        }

        return $filtered !== [] ? $filtered : null;
    }
}
