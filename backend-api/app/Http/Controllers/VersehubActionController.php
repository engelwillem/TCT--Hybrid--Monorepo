<?php

namespace App\Http\Controllers;

use App\Jobs\RecalculateUserMetrics;
use App\Models\UserVerseAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VersehubActionController extends Controller
{
    public function summary(Request $request, string $lang): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'limit' => ['nullable', 'integer', 'min:3', 'max:200'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:recent,oldest'],
        ]);

        $limit = max(3, min((int) ($validated['limit'] ?? 8), 200));
        $queryText = Str::lower(trim((string) ($validated['q'] ?? '')));
        $sort = (string) ($validated['sort'] ?? 'recent');

        $base = UserVerseAction::query()
            ->where('user_id', $request->user()->id)
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

        $rows = UserVerseAction::query()
            ->where('user_id', $request->user()->id)
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
