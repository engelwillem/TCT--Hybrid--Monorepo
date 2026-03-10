<?php

namespace App\Support;

use App\Models\BibleVerse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class VerseHubHomeVerse
{
    /**
     * Daily "VerseHub" verse (rotates once per day; data pulled from local VerseHub dataset).
     *
     * Returns:
     * - ref: canonical ref (book-chapter-verse)
     * - href: verse detail URL
     * - text: verse text
     * - reference: human label (e.g. "Mazmur 119:105")
     */
    public static function get(string $lang, array $bookLabels = []): ?array
    {
        if ($lang !== 'id') return null;

        $cacheKey = 'versehub:home_verse:'.$lang.':'.now()->format('Y-m-d');
        $ttl = now()->endOfDay();

        return Cache::remember($cacheKey, $ttl, function () use ($lang, $bookLabels) {
            $refs = config('versehub_home_verses.'.$lang, []);
            if (!is_array($refs) || count($refs) === 0) {
                $refs = ['mzm-119-105'];
            }

            // Deterministic daily pick, rotates per-day without scheduler.
            $seed = crc32(now()->format('Y-m-d'));
            $idx = $seed % count($refs);
            $ref = Str::lower(trim((string) ($refs[$idx] ?? 'mzm-119-105')));

            if (!preg_match('/^(?<book>[a-z0-9]+)-(?<chapter>\d+)-(?<verse>\d+)$/', $ref, $m)) {
                $ref = 'mzm-119-105';
                $m = ['book' => 'mzm', 'chapter' => 119, 'verse' => 105];
            }

            $book = (string) $m['book'];
            $chapter = (int) $m['chapter'];
            $verse = (int) $m['verse'];

            $row = BibleVerse::query()
                ->select(['text'])
                ->where('provider', 'ayt')
                ->where('lang', 'id')
                ->where('book_code', $book)
                ->where('chapter', $chapter)
                ->where('verse', $verse)
                ->first();

            // Fallback to known-good verse if missing from dataset.
            if (!$row) {
                $book = 'mzm';
                $chapter = 119;
                $verse = 105;
                $ref = 'mzm-119-105';

                $row = BibleVerse::query()
                    ->select(['text'])
                    ->where('provider', 'ayt')
                    ->where('lang', 'id')
                    ->where('book_code', $book)
                    ->where('chapter', $chapter)
                    ->where('verse', $verse)
                    ->first();
            }

            $text = (string) ($row?->text ?? '');
            if (trim($text) === '') {
                return null;
            }

            $bookLabel = (string) ($bookLabels[$book] ?? Str::upper($book));
            $reference = $bookLabel.' '.$chapter.':'.$verse;

            return [
                'ref' => $ref,
                'href' => url('/versehub/id/'.$ref),
                'text' => $text,
                'reference' => $reference,
            ];
        });
    }
}
