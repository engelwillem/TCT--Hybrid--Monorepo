<?php

namespace App\Http\Controllers;

use App\Jobs\RecalculateUserMetrics;
use App\Models\UserVerseAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class VersehubActionController extends Controller
{
    public function mySpiritualJourney(Request $request, string $lang): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'tab' => ['nullable', 'string', 'in:all,favorites,bookmarks,notes'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'string', 'in:recent,oldest'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'cursor' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        abort_unless($user, 401);

        $tab = (string) ($validated['tab'] ?? 'all');
        $sort = (string) ($validated['sort'] ?? 'recent');
        $perPage = (int) ($validated['per_page'] ?? 20);
        $queryText = Str::lower(trim((string) ($validated['q'] ?? '')));

        $query = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where('lang', $lang);

        if ($tab === 'favorites') {
            $query->where('favorited', true);
        } elseif ($tab === 'bookmarks') {
            $query->where('bookmarked', true);
        } elseif ($tab === 'notes') {
            $query->whereNotNull('note_text')->where('note_text', '!=', '');
        }

        if ($queryText !== '') {
            $query->where(function ($builder) use ($queryText) {
                $builder->where('book_code', 'like', '%'.$queryText.'%')
                    ->orWhere('note_text', 'like', '%'.$queryText.'%');
            });
        }

        $cursorMeta = $this->decodeJourneyCursor((string) ($validated['cursor'] ?? ''));
        if (is_array($cursorMeta)) {
            $query->where(function ($builder) use ($cursorMeta, $sort) {
                if ($sort === 'oldest') {
                    $builder->where('updated_at', '>', $cursorMeta['updated_at'])
                        ->orWhere(function ($nested) use ($cursorMeta) {
                            $nested->where('updated_at', '=', $cursorMeta['updated_at'])
                                ->where('id', '>', $cursorMeta['id']);
                        });

                    return;
                }

                $builder->where('updated_at', '<', $cursorMeta['updated_at'])
                    ->orWhere(function ($nested) use ($cursorMeta) {
                        $nested->where('updated_at', '=', $cursorMeta['updated_at'])
                            ->where('id', '<', $cursorMeta['id']);
                    });
            });
        }

        if ($sort === 'oldest') {
            $query->orderBy('updated_at')->orderBy('id');
        } else {
            $query->orderByDesc('updated_at')->orderByDesc('id');
        }

        $rows = $query->limit($perPage + 1)->get();
        $hasNext = $rows->count() > $perPage;
        $items = $rows->take($perPage)->values();

        $serializedItems = $items->map(fn (UserVerseAction $row) => $this->serializeJourneyItem($lang, $row))->values();
        $groupedRows = $serializedItems
            ->groupBy(fn (array $item) => substr((string) ($item['updated_at'] ?? ''), 0, 10))
            ->map(fn ($group, $date) => [
                'date' => $date,
                'items' => $group->values()->all(),
            ])
            ->values()
            ->all();

        $nextCursor = null;
        if ($hasNext) {
            /** @var UserVerseAction $cursorRow */
            $cursorRow = $items->last();
            $nextCursor = $this->encodeJourneyCursor($cursorRow);
        }

        $quoteSource = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where('lang', $lang)
            ->whereNotNull('note_text')
            ->where('note_text', '!=', '')
            ->latest('updated_at')
            ->latest('id')
            ->first();
        $quote = trim((string) ($quoteSource?->note_text ?? ''));
        if (mb_strlen($quote, 'UTF-8') > 180) {
            $quote = rtrim(mb_substr($quote, 0, 180, 'UTF-8')).'...';
        }

        return response()->json([
            'items' => $serializedItems->all(),
            'grouped_rows' => $groupedRows,
            'page' => [
                'per_page' => $perPage,
                'next_cursor' => $nextCursor,
            ],
            'activity_stats' => [
                'quote_of_week' => $quote,
            ],
        ]);
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

    private function serializeJourneyItem(string $lang, UserVerseAction $row): array
    {
        return [
            'ref' => sprintf('%s-%d-%d', $row->book_code, (int) $row->chapter, (int) $row->verse),
            'href' => url('/versehub/'.$lang.'/'.sprintf('%s-%d-%d', $row->book_code, (int) $row->chapter, (int) $row->verse)),
            'book' => (string) $row->book_code,
            'chapter' => (int) $row->chapter,
            'verse' => (int) $row->verse,
            'is_favorite' => (bool) $row->favorited,
            'is_bookmarked' => (bool) $row->bookmarked,
            'is_highlighted' => (bool) $row->highlighted,
            'note' => (string) ($row->note_text ?? ''),
            'updated_at' => optional($row->updated_at)?->toIso8601String(),
        ];
    }

    private function encodeJourneyCursor(UserVerseAction $row): string
    {
        $raw = sprintf('%s|%d', optional($row->updated_at)?->toIso8601String(), (int) $row->id);

        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }

    private function decodeJourneyCursor(string $cursor): ?array
    {
        if ($cursor === '') {
            return null;
        }

        $decoded = base64_decode(strtr($cursor, '-_', '+/'), true);
        if (! is_string($decoded) || ! str_contains($decoded, '|')) {
            return null;
        }

        [$updatedAt, $id] = explode('|', $decoded, 2);
        if (! is_numeric($id) || trim($updatedAt) === '') {
            return null;
        }

        try {
            $parsedUpdatedAt = Carbon::parse($updatedAt)->toDateTimeString();
        } catch (\Throwable) {
            return null;
        }

        return [
            'updated_at' => $parsedUpdatedAt,
            'id' => (int) $id,
        ];
    }
}
