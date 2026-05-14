<?php

namespace App\Http\Controllers;

use App\Jobs\RecalculateUserMetrics;
use App\Models\UserVerseAction;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VersehubActionController extends Controller
{
    public function mySpiritualJourney(Request $request, string $lang): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'tab' => ['nullable', 'in:all,favorites,bookmarks,notes'],
            'sort' => ['nullable', 'in:recent,oldest'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'q' => ['nullable', 'string', 'max:100'],
            'cursor' => ['nullable', 'string', 'max:120'],
        ]);

        $user = $request->user();
        if (! $user) {
            return response()->json([
                'items' => [],
                'grouped_rows' => [],
                'page' => [
                    'per_page' => 20,
                    'next_cursor' => null,
                    'has_more' => false,
                ],
                'activity_stats' => [
                    'quote_of_week' => '',
                ],
            ]);
        }

        $tab = (string) ($validated['tab'] ?? 'all');
        $sort = (string) ($validated['sort'] ?? 'recent');
        $perPage = (int) ($validated['per_page'] ?? 20);
        $queryText = Str::lower(trim((string) ($validated['q'] ?? '')));
        $rawCursor = trim((string) ($validated['cursor'] ?? ''));

        $base = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where('lang', $lang);

        if ($tab === 'favorites') {
            $base->where('favorited', true);
        } elseif ($tab === 'bookmarks') {
            $base->where('bookmarked', true);
        } elseif ($tab === 'notes') {
            $base->whereNotNull('note_text')->where('note_text', '!=', '');
        }

        if ($queryText !== '') {
            $compact = preg_replace('/\s+/', '', $queryText) ?? $queryText;
            $base->where('book_code', 'like', '%'.$compact.'%');
        }

        $cursor = $this->parseCursor($rawCursor);
        if ($cursor !== null) {
            if ($sort === 'oldest') {
                $base->where(function ($q) use ($cursor) {
                    $q->where('updated_at', '>', $cursor['updated_at'])
                        ->orWhere(function ($nested) use ($cursor) {
                            $nested->where('updated_at', '=', $cursor['updated_at'])
                                ->where('id', '>', $cursor['id']);
                        });
                });
            } else {
                $base->where(function ($q) use ($cursor) {
                    $q->where('updated_at', '<', $cursor['updated_at'])
                        ->orWhere(function ($nested) use ($cursor) {
                            $nested->where('updated_at', '=', $cursor['updated_at'])
                                ->where('id', '<', $cursor['id']);
                        });
                });
            }
        }

        if ($sort === 'oldest') {
            $base->orderBy('updated_at')->orderBy('id');
        } else {
            $base->orderByDesc('updated_at')->orderByDesc('id');
        }

        $rows = $base->limit($perPage + 1)->get();
        $hasMore = $rows->count() > $perPage;
        $pageRows = $rows->take($perPage)->values();

        $items = $pageRows->map(fn (UserVerseAction $row) => $this->mapJourneyItem($lang, $row))->all();
        $nextCursor = null;
        if ($hasMore && $pageRows->isNotEmpty()) {
            $last = $pageRows->last();
            $nextCursor = $this->buildCursor($last);
        }

        $groupedRows = [
            [
                'label' => 'Activity',
                'items' => $items,
            ],
        ];

        $quoteSource = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where('lang', $lang)
            ->whereNotNull('note_text')
            ->where('note_text', '!=', '')
            ->orderByDesc('updated_at')
            ->first();
        $quote = $this->truncateQuote((string) ($quoteSource->note_text ?? ''), 180);

        return response()->json([
            'items' => $items,
            'grouped_rows' => $groupedRows,
            'page' => [
                'per_page' => $perPage,
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
            ],
            'activity_stats' => [
                'quote_of_week' => $quote,
            ],
        ]);
    }

    private function mapJourneyItem(string $lang, UserVerseAction $row): array
    {
        $ref = sprintf('%s-%d-%d', $row->book_code, (int) $row->chapter, (int) $row->verse);

        return [
            'ref' => $ref,
            'href' => url('/versehub/'.$lang.'/'.$ref),
            'book' => $row->book_code,
            'chapter' => (int) $row->chapter,
            'verse' => (int) $row->verse,
            'is_favorite' => (bool) $row->favorited,
            'is_bookmarked' => (bool) $row->bookmarked,
            'note' => (string) ($row->note_text ?? ''),
            'updated_at' => optional($row->updated_at)?->toIso8601String(),
        ];
    }

    private function parseCursor(string $rawCursor): ?array
    {
        if ($rawCursor === '') {
            return null;
        }

        $decoded = base64_decode($rawCursor, true);
        if (! is_string($decoded) || $decoded === '') {
            return null;
        }

        [$timestamp, $id] = array_pad(explode('|', $decoded, 2), 2, null);
        if (! is_numeric($id) || ! is_numeric($timestamp)) {
            return null;
        }

        try {
            $dt = CarbonImmutable::createFromTimestampUTC((int) $timestamp);
        } catch (\Throwable) {
            return null;
        }

        return [
            'updated_at' => $dt->toDateTimeString(),
            'id' => (int) $id,
        ];
    }

    private function buildCursor(UserVerseAction $row): string
    {
        $timestamp = (int) optional($row->updated_at)->timestamp;
        return base64_encode($timestamp.'|'.$row->id);
    }

    private function truncateQuote(string $text, int $maxLength): string
    {
        $clean = trim($text);
        if ($clean === '') {
            return '';
        }
        if (mb_strlen($clean) <= $maxLength) {
            return $clean;
        }

        return rtrim(mb_substr($clean, 0, $maxLength)).'...';
    }

    public function summary(Request $request, string $lang): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:200'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:recent,oldest'],
        ]);

        $limit = max(3, min((int) ($validated['limit'] ?? 8), 200));
        $queryText = Str::lower(trim((string) ($validated['q'] ?? '')));
        $sort = (string) ($validated['sort'] ?? 'recent');
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'favorites' => [],
                'bookmarks' => [],
                'notes' => [],
                'counts' => [
                    'favorites' => 0,
                    'bookmarks' => 0,
                    'notes' => 0,
                ],
            ]);
        }

        $base = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where('lang', $lang);

        $applySearch = function ($query) use ($queryText) {
            if ($queryText === '') {
                return $query;
            }

            $compact = preg_replace('/\s+/', '', $queryText) ?? $queryText;

            return $query->where(function ($q) use ($compact) {
                $q->where('book_code', 'like', '%'.$compact.'%');
            });
        };

        $applyOrder = function ($query) use ($sort) {
            if ($sort === 'oldest') {
                return $query->orderBy('updated_at')->orderBy('id');
            }

            return $query->orderByDesc('updated_at')->orderByDesc('id');
        };

        $mapRow = fn (UserVerseAction $row) => [
            'ref' => sprintf('%s-%d-%d', $row->book_code, (int) $row->chapter, (int) $row->verse),
            'href' => url('/versehub/'.$lang.'/'.sprintf('%s-%d-%d', $row->book_code, (int) $row->chapter, (int) $row->verse)),
            'book' => $row->book_code,
            'chapter' => (int) $row->chapter,
            'verse' => (int) $row->verse,
            'note' => (string) ($row->note_text ?? ''),
            'updated_at' => optional($row->updated_at)?->toIso8601String(),
            'updated_at_ts' => optional($row->updated_at)?->timestamp ?? 0,
        ];

        $favoritesQuery = (clone $base)->where('favorited', true);
        $favoritesQuery = $applySearch($favoritesQuery);
        $favorites = $applyOrder($favoritesQuery)
            ->limit($limit)
            ->get()
            ->map($mapRow)
            ->values()
            ->all();

        $bookmarksQuery = (clone $base)->where('bookmarked', true);
        $bookmarksQuery = $applySearch($bookmarksQuery);
        $bookmarks = $applyOrder($bookmarksQuery)
            ->limit($limit)
            ->get()
            ->map($mapRow)
            ->values()
            ->all();

        $notesQuery = (clone $base)
            ->whereNotNull('note_text')
            ->where('note_text', '!=', '');
        $notesQuery = $applySearch($notesQuery);
        $notes = $applyOrder($notesQuery)
            ->limit($limit)
            ->get()
            ->map($mapRow)
            ->values()
            ->all();

        $counts = [
            'favorites' => (clone $base)->where('favorited', true)->count(),
            'bookmarks' => (clone $base)->where('bookmarked', true)->count(),
            'notes' => (clone $base)->whereNotNull('note_text')->where('note_text', '!=', '')->count(),
        ];

        return response()->json([
            'favorites' => $favorites,
            'bookmarks' => $bookmarks,
            'notes' => $notes,
            'counts' => $counts,
        ]);
    }

    public function index(Request $request, string $lang): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'book' => ['required', 'string', 'max:24'],
            'chapter' => ['required', 'integer', 'min:1'],
        ]);

        $book = Str::lower(trim((string) $validated['book']));
        $chapter = (int) $validated['chapter'];
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'book' => $book,
                'chapter' => $chapter,
                'actions' => [],
            ]);
        }

        $rows = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where('lang', $lang)
            ->where('book_code', $book)
            ->where('chapter', $chapter)
            ->get([
                'book_code',
                'chapter',
                'verse',
                'favorited',
                'bookmarked',
                'highlighted',
                'highlight_color',
                'note_text',
            ]);

        $actions = [];
        foreach ($rows as $row) {
            $key = sprintf('%s-%d-%d', $row->book_code, (int) $row->chapter, (int) $row->verse);
            $actions[$key] = [
                'favorite' => (bool) $row->favorited,
                'bookmarked' => (bool) $row->bookmarked,
                'highlighted' => (bool) $row->highlighted,
                'highlightColor' => $row->highlight_color ?: 'yellow',
                'note' => (string) ($row->note_text ?? ''),
            ];
        }

        return response()->json([
            'book' => $book,
            'chapter' => $chapter,
            'actions' => $actions,
        ]);
    }

    public function upsert(Request $request, string $lang): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'book' => ['required', 'string', 'max:24'],
            'chapter' => ['required', 'integer', 'min:1'],
            'verse' => ['required', 'integer', 'min:1'],
            'favorite' => ['nullable', 'boolean'],
            'bookmarked' => ['nullable', 'boolean'],
            'highlighted' => ['nullable', 'boolean'],
            'highlightColor' => ['nullable', 'string', 'max:16'],
            'note' => ['nullable', 'string', 'max:3000'],
        ]);

        $book = Str::lower(trim((string) $validated['book']));
        $chapter = (int) $validated['chapter'];
        $verse = (int) $validated['verse'];
        $note = array_key_exists('note', $validated) ? trim((string) ($validated['note'] ?? '')) : null;

        $row = UserVerseAction::query()->firstOrNew([
            'user_id' => $request->user()->id,
            'lang' => $lang,
            'book_code' => $book,
            'chapter' => $chapter,
            'verse' => $verse,
        ]);

        $row->favorited = array_key_exists('favorite', $validated)
            ? (bool) $validated['favorite']
            : (bool) $row->favorited;
        $row->bookmarked = array_key_exists('bookmarked', $validated)
            ? (bool) $validated['bookmarked']
            : (bool) $row->bookmarked;
        $row->highlighted = array_key_exists('highlighted', $validated)
            ? (bool) $validated['highlighted']
            : (bool) $row->highlighted;

        if (array_key_exists('highlightColor', $validated)) {
            $row->highlight_color = Str::lower(trim((string) ($validated['highlightColor'] ?? ''))) ?: null;
        }

        if (array_key_exists('note', $validated)) {
            $row->note_text = ($note === null || $note === '') ? null : $note;
        }

        $row->save();

        RecalculateUserMetrics::dispatch($request->user()->id);

        return response()->json([
            'ok' => true,
            'key' => sprintf('%s-%d-%d', $row->book_code, (int) $row->chapter, (int) $row->verse),
        ]);
    }
}
