<?php

namespace App\Http\Controllers;

use App\Models\BibleVerse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class VerseHubLibraryController extends Controller
{
    public function index(Request $request, string $lang)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);
        $dbLang = $lang === 'en' ? 'id' : $lang;

        $q = trim((string) $request->query('q', ''));
        $s = trim((string) $request->query('s', ''));
        $book = Str::lower(trim((string) $request->query('book', '')));
        $chapter = (int) $request->query('chapter', 0);

        $quick = null;
        $quickVerse = null;

        if ($q !== '') {
            $quick = $this->parseRefInput($q);
            if ($quick) {
                $quickVerse = BibleVerse::query()
                    ->where('provider', 'ayt')
                    ->where('lang', $dbLang)
                    ->where('book_code', $quick['book'])
                    ->where('chapter', $quick['chapter'])
                    ->where('verse', $quick['verse'])
                    ->first();
            }
        }

        // Show available books from DB (AYT).
        $books = [];
        $rows = BibleVerse::query()
            ->selectRaw('book_code, COUNT(*) as c')
            ->where('provider', 'ayt')
            ->where('lang', $dbLang)
            ->groupBy('book_code')
            ->orderBy('book_code')
            ->get();

        $labelMap = [
            'kej' => 'Kejadian',
            'kel' => 'Keluaran',
            'mzm' => 'Mazmur',
            'mat' => 'Matius',
            'mrk' => 'Markus',
            'luk' => 'Lukas',
            'yoh' => 'Yohanes',
            'kis' => 'Kisah Para Rasul',
            'rom' => 'Roma',
            '1kor' => '1 Korintus',
            '2kor' => '2 Korintus',
            'ef' => 'Efesus',
            'flp' => 'Filipi',
            'kol' => 'Kolose',
            'flm' => 'Filemon',
        ];

        foreach ($rows as $r) {
            $code = (string) $r->book_code;
            $books[] = [
                'code' => $code,
                'label' => $labelMap[$code] ?? Str::upper($code),
                'count' => (int) ($r->c ?? 0),
            ];
        }

        // Browse mode (A): book -> chapter -> verse
        $mode = 'books';
        $selectedBook = null;
        $selectedBookLabel = null;
        $chapters = [];
        $verses = [];

        if ($book !== '') {
            $selectedBook = $book;
            $selectedBookLabel = Arr::first($books, fn ($b) => $b['code'] === $book)['label'] ?? Str::upper($book);
            $mode = 'chapters';

            // Validate the book exists in DB.
            $bookExists = BibleVerse::query()
                ->where('provider', 'ayt')
                ->where('lang', $dbLang)
                ->where('book_code', $book)
                ->exists();
            abort_unless($bookExists, 404);

            // Chapter list.
            $chapters = BibleVerse::query()
                ->select('chapter')
                ->where('provider', 'ayt')
                ->where('lang', $dbLang)
                ->where('book_code', $book)
                ->distinct()
                ->orderBy('chapter')
                ->pluck('chapter')
                ->map(fn ($c) => (int) $c)
                ->all();

            if ($chapter > 0) {
                $mode = 'verses';

                // Validate chapter exists.
                $chapterExists = BibleVerse::query()
                    ->where('provider', 'ayt')
                    ->where('lang', $dbLang)
                    ->where('book_code', $book)
                    ->where('chapter', $chapter)
                    ->exists();
                abort_unless($chapterExists, 404);

                $verses = BibleVerse::query()
                    ->select(['verse', 'text'])
                    ->where('provider', 'ayt')
                    ->where('lang', $dbLang)
                    ->where('book_code', $book)
                    ->where('chapter', $chapter)
                    ->orderBy('verse')
                    ->get()
                    ->map(function ($v) {
                        return [
                            'verse' => (int) $v->verse,
                            'excerpt' => Str::limit((string) $v->text, 110),
                        ];
                    })
                    ->all();
            }
        }

        // Full-text search (section below) - ID only (AYT)
        $searchResults = [];
        if ($s !== '') {
            $limit = 25;
            $term = Str::lower($s);

            $rows = BibleVerse::query()
                ->select(['book_code', 'chapter', 'verse', 'reference', 'text'])
                ->where('provider', 'ayt')
                ->where('lang', $dbLang)
                ->where(function ($query) use ($term): void {
                    $like = '%'.$term.'%';
                    $query
                        ->where('reference', 'like', $like)
                        ->orWhere('text', 'like', $like);
                })
                ->orderBy('book_code')
                ->orderBy('chapter')
                ->orderBy('verse')
                ->limit($limit)
                ->get();

            foreach ($rows as $r) {
                $searchResults[] = [
                    'book_code' => (string) $r->book_code,
                    'chapter' => (int) $r->chapter,
                    'verse' => (int) $r->verse,
                    'reference' => (string) ($r->reference ?? ''),
                    'text' => (string) ($r->text ?? ''),
                ];
            }
        }

        return view('versehub.library', [
            'lang' => $lang,
            'q' => $q,
            's' => $s,
            'title' => $lang === 'id' ? 'VerseHub Library (ID)' : 'VerseHub Library (EN)',
            'canonical_url' => url("/versehub/{$lang}"),
            'books' => $books,
            'mode' => $mode,
            'selected_book' => $selectedBook,
            'selected_book_label' => $selectedBookLabel,
            'selected_chapter' => $chapter > 0 ? $chapter : null,
            'chapters' => $chapters,
            'verses' => $verses,
            'search_results' => $searchResults,
            'quick' => $quick,
            'quick_verse' => $quickVerse ? [
                'reference' => $quickVerse->reference,
                'text' => $quickVerse->text,
                'provider' => $quickVerse->provider,
                'translation_name' => $quickVerse->translation_name,
            ] : null,
        ]);
    }

    public function suggest(Request $request, string $lang)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);
        $dbLang = $lang === 'en' ? 'id' : $lang;

        $q = Str::lower(trim((string) $request->query('q', '')));

        $richItems = [];
        $items = [];
        $normalized = $this->normalizeRefInput($q);
        $books = $this->readerBookDictionary();

        $parsed = $this->parseFlexibleRef($normalized);
        if ($parsed !== null) {
            $bookCode = $this->resolveReaderBookCode($parsed['book']);
            if ($bookCode !== null) {
                $chapter = (int) $parsed['chapter'];
                $bookLabel = $books[$bookCode] ?? Str::upper($bookCode);
                $value = $bookCode.' '.$chapter;
                $href = '/versehub/id/'.urlencode($bookCode).'-'.urlencode((string) $chapter);
                $label = $bookLabel.' '.$chapter;

                if ($parsed['verses'] !== null && $parsed['verses'] !== '') {
                    $value .= ':'.$parsed['verses'];
                    $href = '/versehub/id?q='.urlencode($value);
                    $label .= ':'.$parsed['verses'];
                }

                $richItems[] = [
                    'type' => 'direct',
                    'label' => $label,
                    'value' => $value,
                    'href' => $href,
                ];
            }
        }

        $cross = $this->parseCrossChapterRef($normalized);
        if ($cross !== null) {
            $bookCode = $this->resolveReaderBookCode((string) $cross['book']);
            if ($bookCode !== null) {
                $bookLabel = $books[$bookCode] ?? Str::upper($bookCode);
                $ch1 = (int) $cross['ch1'];
                $v1 = (int) $cross['v1'];
                $ch2 = (int) $cross['ch2'];
                $v2 = (int) $cross['v2'];

                $maxV1 = (int) BibleVerse::query()
                    ->where('provider', 'ayt')
                    ->where('lang', $dbLang)
                    ->where('book_code', $bookCode)
                    ->where('chapter', $ch1)
                    ->max('verse');
                $maxV2 = (int) BibleVerse::query()
                    ->where('provider', 'ayt')
                    ->where('lang', $dbLang)
                    ->where('book_code', $bookCode)
                    ->where('chapter', $ch2)
                    ->max('verse');

                if ($maxV1 > 0 && $maxV2 > 0) {
                    $startStart = min(max($v1, 1), $maxV1);
                    $endEnd = min(max($v2, 1), $maxV2);
                    $firstValue = sprintf('%s %d:%d-%d', $bookCode, $ch1, $startStart, $maxV1);
                    $secondValue = sprintf('%s %d:%d-%d', $bookCode, $ch2, 1, $endEnd);

                    $richItems[] = [
                        'type' => 'cross',
                        'label' => sprintf('%s %d:%d-%d', $bookLabel, $ch1, $startStart, $maxV1),
                        'value' => $firstValue,
                        'href' => '/versehub/id?q='.urlencode($firstValue),
                    ];
                    $richItems[] = [
                        'type' => 'cross',
                        'label' => sprintf('%s %d:%d-%d', $bookLabel, $ch2, 1, $endEnd),
                        'value' => $secondValue,
                        'href' => '/versehub/id?q='.urlencode($secondValue),
                    ];
                }
            }
        }

        // Book suggestions by code OR full label (e.g. "kol", "kolose", "1 petrus").
        $needle = trim($normalized);
        if ($needle !== '') {
            foreach ($books as $code => $label) {
                $labelNorm = Str::lower($label);
                $match = Str::startsWith($code, $needle)
                    || Str::startsWith($labelNorm, $needle)
                    || Str::contains($labelNorm, $needle);
                if (! $match) {
                    continue;
                }
                $richItems[] = [
                    'type' => 'book',
                    'label' => $label,
                    'value' => $code,
                    'href' => '/versehub/id?q='.urlencode($code.' 1'),
                ];
                if (count($richItems) >= 12) {
                    break;
                }
            }
        }

        // If it looks like "book chapter-prefix", suggest real chapter options.
        if (preg_match('/^(?<book>[a-z0-9 ]+?)\s+(?<chapter>\d*)$/', $normalized, $m)) {
            $bookCode = $this->resolveReaderBookCode((string) $m['book']);
            if ($bookCode !== null) {
                $chapterPrefix = (string) $m['chapter'];
                $chapterRows = BibleVerse::query()
                    ->select('chapter')
                    ->where('provider', 'ayt')
                    ->where('lang', $dbLang)
                    ->where('book_code', $bookCode)
                    ->distinct()
                    ->orderBy('chapter')
                    ->pluck('chapter')
                    ->all();
                foreach ($chapterRows as $ch) {
                    $chText = (string) $ch;
                    if ($chapterPrefix !== '' && ! Str::startsWith($chText, $chapterPrefix)) {
                        continue;
                    }
                    $label = ($books[$bookCode] ?? Str::upper($bookCode)).' '.$chText;
                    $richItems[] = [
                        'type' => 'chapter',
                        'label' => $label,
                        'value' => $bookCode.' '.$chText,
                        'href' => '/versehub/id/'.urlencode($bookCode).'-'.urlencode($chText),
                    ];
                    if (count($richItems) >= 12) {
                        break;
                    }
                }
            }
        }

        $seen = [];
        $deduped = [];
        foreach ($richItems as $item) {
            $key = ($item['href'] ?? '').'|'.($item['value'] ?? '');
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $deduped[] = $item;
            if (count($deduped) >= 12) {
                break;
            }
        }
        $richItems = $deduped;
        $items = array_values(array_map(fn (array $it) => (string) ($it['value'] ?? ''), $richItems));

        return response()->json([
            'query' => $q,
            'items' => $items,
            'rich_items' => $richItems,
        ]);
    }

    private function parseRefInput(string $q): ?array
    {
        $q = Str::lower(trim($q));
        if ($q === '') {
            return null;
        }

        // Accept: "kej-1-1" or "kej 1:1" or "kej 1 1"
        $q = str_replace([':', '.'], [' ', ' '], $q);
        $q = preg_replace('/\s+/', ' ', $q) ?? $q;

        if (preg_match('/^(?<book>[a-z0-9]+)[\s-]+(?<chapter>\d+)[\s-]+(?<verse>\d+)$/', $q, $m)) {
            return [
                'book' => (string) $m['book'],
                'chapter' => (int) $m['chapter'],
                'verse' => (int) $m['verse'],
            ];
        }

        return null;
    }

    private function normalizeRefInput(string $q): string
    {
        $s = Str::lower(trim($q));
        $s = str_replace(['–', '—', '_', '.'], ['-', '-', '-', '-'], $s);
        $s = preg_replace('/\s+/', ' ', $s) ?? $s;

        return trim($s);
    }

    private function parseFlexibleRef(string $raw): ?array
    {
        $s = $this->normalizeRefInput($raw);
        if ($s === '') {
            return null;
        }

        if (preg_match('/^(?<book>[a-z0-9 ]+)\s+(?<ch>\d+)\s*:\s*(?<verses>[\d,\-\s]+)$/', $s, $m)) {
            return ['book' => (string) $m['book'], 'chapter' => (int) $m['ch'], 'verses' => preg_replace('/\s+/', '', (string) $m['verses'])];
        }

        if (preg_match('/^(?<book>[a-z0-9]+)-(?<ch>\d+)-(?<verses>[\d,\-\s]+)$/', $s, $m)) {
            return ['book' => (string) $m['book'], 'chapter' => (int) $m['ch'], 'verses' => preg_replace('/\s+/', '', (string) $m['verses'])];
        }

        if (preg_match('/^(?<book>[a-z0-9 ]+)\s+(?<ch>\d+)$/', $s, $m)) {
            return ['book' => (string) $m['book'], 'chapter' => (int) $m['ch'], 'verses' => null];
        }

        return null;
    }

    private function parseCrossChapterRef(string $raw): ?array
    {
        $s = $this->normalizeRefInput($raw);
        if ($s === '') {
            return null;
        }

        if (! preg_match('/^(?<book>[a-z0-9 ]+)\s+(?<ch1>\d+)\s*:\s*(?<v1>\d+)\s*-\s*(?<ch2>\d+)\s*:\s*(?<v2>\d+)$/', $s, $m)) {
            return null;
        }

        return [
            'book' => (string) $m['book'],
            'ch1' => (int) $m['ch1'],
            'v1' => (int) $m['v1'],
            'ch2' => (int) $m['ch2'],
            'v2' => (int) $m['v2'],
        ];
    }

    private function readerBookDictionary(): array
    {
        return \App\Http\Controllers\VerseHubReaderController::ID_BOOK_LABELS;
    }

    private function resolveReaderBookCode(string $rawBook): ?string
    {
        $token = Str::lower(trim($rawBook));
        if ($token === '') {
            return null;
        }
        $books = $this->readerBookDictionary();
        if (array_key_exists($token, $books)) {
            return $token;
        }

        $aliases = config('versehub_books.aliases', []);
        if (is_array($aliases)) {
            $alias = $aliases[$token] ?? null;
            if (is_string($alias)) {
                $alias = Str::lower(trim($alias));
                if (array_key_exists($alias, $books)) {
                    return $alias;
                }
            }
        }

        foreach ($books as $code => $label) {
            $labelNorm = Str::lower(trim((string) $label));
            if ($token === $labelNorm || Str::startsWith($labelNorm, $token) || Str::contains($labelNorm, $token)) {
                return $code;
            }
        }

        return null;
    }
}
