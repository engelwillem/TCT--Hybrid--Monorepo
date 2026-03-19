<?php

namespace App\Support;

use App\Models\BibleVerse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class VerseHubWelcomeVerse
{
    /**
     * Pick a daily "welcome verse" for /today.
     * This should be different from sidebar HomeVerse and Community daily verse when possible.
     */
    public static function get(string $lang, array $bookLabels = [], array $excludeRefs = []): ?array
    {
        if ($lang !== 'id') {
            return null;
        }

        $excludeRefs = collect($excludeRefs)
            ->filter(fn ($r) => is_string($r) && trim($r) !== '')
            ->map(fn ($r) => Str::lower(trim((string) $r)))
            ->unique()
            ->values()
            ->all();

        $cacheKey = 'versehub:welcome_verse:v2:'.$lang.':'.now()->format('Y-m-d').':'.md5(json_encode($excludeRefs));
        $ttl = now()->endOfDay();

        return Cache::remember($cacheKey, $ttl, function () use ($bookLabels, $excludeRefs) {
            // Curated "heart-touching" pools:
            // empathy, social compassion, hope, courage, comfort, restoration.
            $refsByMood = [
                'empathy' => [
                    'mzm-34-19', 'mzm-147-3', 'mat-11-28', 'ibr-4-15', 'ibr-4-16',
                    '1ptr-5-7', 'yes-43-2', 'yes-41-10', 'rat-3-22', 'rat-3-23',
                ],
                'social' => [
                    'mat-5-14', 'mat-5-16', 'gal-6-2', 'rom-12-15', 'rom-12-10',
                    'kol-3-12', '1tes-5-11', 'ibr-10-24', 'mik-6-8', 'ams-14-31',
                ],
                'hope' => [
                    'rom-15-13', 'rom-8-28', 'rom-8-38', 'rom-8-39', 'yer-29-11',
                    'mzm-27-1', 'mzm-46-2', 'yes-40-31', 'flp-4-6', 'yoh-16-33',
                ],
                'courage' => [
                    '2tim-1-7', 'yos-1-9', 'mzm-23-4', 'mzm-112-7', 'yes-41-13',
                    'uli-31-6', 'ibr-13-6', 'flp-4-13', '2kor-12-9', 'mzm-18-3',
                ],
                'comfort' => [
                    'mzm-55-23', 'mzm-121-1', 'mzm-121-2', 'mzm-73-26', 'yoh-14-27',
                    'mat-28-20', 'yes-43-4', 'nah-1-7', 'mzm-23-6', 'mzm-94-19',
                ],
            ];

            $refs = collect($refsByMood)
                ->flatten()
                ->map(fn ($r) => Str::lower(trim((string) $r)))
                ->filter()
                ->unique()
                ->values()
                ->all();

            $refs = array_values(array_map(
                fn ($r) => Str::lower(trim((string) $r)),
                $refs
            ));

            // Deterministic "daily random": same verse for a day, changes next day.
            // Use stable hash ordering so each day feels random but reproducible.
            $seed = now()->format('Y-m-d');
            $ordered = $refs;
            usort($ordered, function (string $a, string $b) use ($seed): int {
                $ha = crc32($seed.':'.$a);
                $hb = crc32($seed.':'.$b);

                return $ha <=> $hb;
            });

            $selected = null;
            $book = null;
            $chapter = null;
            $verse = null;
            $row = null;

            foreach ($ordered as $candidate) {
                if (in_array($candidate, $excludeRefs, true)) {
                    continue;
                }
                if (! preg_match('/^(?<book>[a-z0-9]+)-(?<chapter>\d+)-(?<verse>\d+)$/', $candidate, $m)) {
                    continue;
                }

                $tryBook = (string) $m['book'];
                $tryChapter = (int) $m['chapter'];
                $tryVerse = (int) $m['verse'];

                $tryRow = BibleVerse::query()
                    ->select(['text'])
                    ->where('provider', 'ayt')
                    ->where('lang', 'id')
                    ->where('book_code', $tryBook)
                    ->where('chapter', $tryChapter)
                    ->where('verse', $tryVerse)
                    ->first();

                if (! $tryRow || trim((string) $tryRow->text) === '') {
                    continue;
                }

                $selected = $candidate;
                $book = $tryBook;
                $chapter = $tryChapter;
                $verse = $tryVerse;
                $row = $tryRow;
                break;
            }

            if (! $selected || ! $row || ! $book || ! $chapter || ! $verse) {
                return null;
            }

            $bookLabel = (string) ($bookLabels[$book] ?? Str::upper($book));
            $reference = $bookLabel.' '.$chapter.':'.$verse;

            return [
                'ref' => $selected,
                'book_code' => $book,
                'chapter' => $chapter,
                'verse' => $verse,
                'quote' => (string) $row->text,
                'cta_label' => 'Baca Alkitab',
                'cta_href' => '/versehub/id/'.$selected,
                'reference' => $reference,
                'title' => 'Ayat Penguatan Hari Ini',
            ];
        });
    }
}
