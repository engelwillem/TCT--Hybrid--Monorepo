<?php

namespace App\Http\Controllers;

use App\Models\BibleVerse;
use App\Models\MemberPost;
use App\Models\ReflectionResponse;
use App\Models\UserMetric;
use App\Models\UserVerseAction;
use App\Services\UserMetricsService;
use App\Services\VerseHubActivityService;
use App\Services\VerseHubMentorService;
use App\Support\VerseHubHomeVerse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class VerseHubReaderController extends Controller
{
    private const ACTIVITY_QUOTE_POST_TYPE = 'versehub_activity_quote';
    private const ID_BOOK_ORDER = [
        'kej',
        'kel',
        'ima',
        'bil',
        'uli',
        'yos',
        'hak',
        'rut',
        '1sam',
        '2sam',
        '1raj',
        '2raj',
        '1taw',
        '2taw',
        'ezr',
        'neh',
        'est',
        'ayb',
        'mzm',
        'ams',
        'pkh',
        'kid',
        'yes',
        'yer',
        'rat',
        'yeh',
        'dan',
        'hos',
        'yoe',
        'amo',
        'oba',
        'yun',
        'mik',
        'nah',
        'hab',
        'zef',
        'hag',
        'zak',
        'mal',
        'mat',
        'mrk',
        'luk',
        'yoh',
        'kis',
        'rom',
        '1kor',
        '2kor',
        'gal',
        'ef',
        'flp',
        'kol',
        '1tes',
        '2tes',
        '1tim',
        '2tim',
        'tit',
        'flm',
        'ibr',
        'yak',
        '1ptr',
        '2ptr',
        '1yoh',
        '2yoh',
        '3yoh',
        'yud',
        'why',
    ];

    public const ID_BOOK_LABELS = [
        'kej' => 'Kejadian',
        'kel' => 'Keluaran',
        'ima' => 'Imamat',
        'bil' => 'Bilangan',
        'uli' => 'Ulangan',
        'yos' => 'Yosua',
        'hak' => 'Hakim-hakim',
        'rut' => 'Rut',
        '1sam' => '1 Samuel',
        '2sam' => '2 Samuel',
        '1raj' => '1 Raja-raja',
        '2raj' => '2 Raja-raja',
        '1taw' => '1 Tawarikh',
        '2taw' => '2 Tawarikh',
        'ezr' => 'Ezra',
        'neh' => 'Nehemia',
        'est' => 'Ester',
        'ayb' => 'Ayub',
        'mzm' => 'Mazmur',
        'ams' => 'Amsal',
        'pkh' => 'Pengkhotbah',
        'kid' => 'Kidung Agung',
        'yes' => 'Yesaya',
        'yer' => 'Yeremia',
        'rat' => 'Ratapan',
        'yeh' => 'Yehezkiel',
        'dan' => 'Daniel',
        'hos' => 'Hosea',
        'yoe' => 'Yoel',
        'amo' => 'Amos',
        'oba' => 'Obaja',
        'yun' => 'Yunus',
        'mik' => 'Mikha',
        'nah' => 'Nahum',
        'hab' => 'Habakuk',
        'zef' => 'Zefanya',
        'hag' => 'Hagai',
        'zak' => 'Zakharia',
        'mal' => 'Maleakhi',
        'mat' => 'Matius',
        'mrk' => 'Markus',
        'luk' => 'Lukas',
        'yoh' => 'Yohanes',
        'kis' => 'Kisah Para Rasul',
        'rom' => 'Roma',
        '1kor' => '1 Korintus',
        '2kor' => '2 Korintus',
        'gal' => 'Galatia',
        'ef' => 'Efesus',
        'flp' => 'Filipi',
        'kol' => 'Kolose',
        '1tes' => '1 Tesalonika',
        '2tes' => '2 Tesalonika',
        '1tim' => '1 Timotius',
        '2tim' => '2 Timotius',
        'tit' => 'Titus',
        'flm' => 'Filemon',
        'ibr' => 'Ibrani',
        'yak' => 'Yakobus',
        '1ptr' => '1 Petrus',
        '2ptr' => '2 Petrus',
        '1yoh' => '1 Yohanes',
        '2yoh' => '2 Yohanes',
        '3yoh' => '3 Yohanes',
        'yud' => 'Yudas',
        'why' => 'Wahyu',
        // Legacy short codes (display full Indonesian names).
        'am' => 'Amos',
        'im' => 'Imamat',
        'mi' => 'Mikha',
        'ob' => 'Obaja',
        'rm' => 'Roma',
        'ul' => 'Ulangan',
        'yl' => 'Yoel',
        'za' => 'Zakharia',
    ];

    private const ID_NT_CODES = [
        'mat',
        'mrk',
        'luk',
        'yoh',
        'kis',
        'rom',
        '1kor',
        '2kor',
        'gal',
        'ef',
        'flp',
        'kol',
        '1tes',
        '2tes',
        '1tim',
        '2tim',
        'tit',
        'flm',
        'ibr',
        'yak',
        '1ptr',
        '2ptr',
        '1yoh',
        '2yoh',
        '3yoh',
        'yud',
        'why',
    ];
    private const ID_BOOK_CHAPTER_TOTALS = [
        'mzm' => 150,
    ];

    /**
     * VerseHub Reader entry.
     *
     * Design goal: ESV-like reading experience (ID first), while keeping EN lightweight.
     * For now:
     * - ID: reader supports browse book -> chapter and renders a full chapter.
     * - EN: redirects to share-friendly verse page entry.
     */
    public function index(Request $request, string $lang)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        // EN does not have local dataset yet. Keep it lightweight.
        if ($lang === 'en') {
            return redirect()->to('/versehub/id');
        }

        // Backward-compat: old query-param reader URLs -> redirect to SEO path.
        $bookQ = Str::lower(trim((string) $request->query('book', '')));
        $chapterQ = (int) $request->query('chapter', 0);
        if ($bookQ !== '' && $chapterQ > 0) {
            return redirect()->to(url("/versehub/id/{$bookQ}-{$chapterQ}"), $this->canonicalRedirectCode());
        }

        $bookCodes = $this->availableIdBookCodesCanonical();
        $books = $this->buildIdBooks($bookCodes);
        $searchQuery = trim((string) $request->query('q', ''));
        $searchError = null;
        $searchMeta = null;
        $searchRecommendations = [];
        $crossPanels = [];

        $selectedBook = null;
        $selectedChapter = null;
        $chapters = [];
        $chapterLabel = null;
        $verses = [];
        $prevUrl = null;
        $nextUrl = null;

        if ($searchQuery !== '') {
            $parsed = $this->parseReaderReference($searchQuery);
            if ($parsed === null) {
                $cross = $this->parseCrossChapterReference($searchQuery);
                if ($cross !== null) {
                    $searchRecommendations = $this->buildCrossChapterRecommendations($cross, $books, $bookCodes);
                    $crossPanels = $this->buildCrossChapterPanels($cross, $books, $bookCodes);
                    $searchError = $searchRecommendations !== []
                        ? 'Input lintas pasal terdeteksi. Pilih rekomendasi bacaan per pasal di bawah.'
                        : 'Input lintas pasal terdeteksi, tetapi referensinya belum ditemukan.';
                } else {
                    $searchError = 'Format belum dikenali. Contoh: mzm 119:105, yoh 3:16-18, atau 1ptr-3-1.';
                }
            } else {
                $book = $this->resolveReaderBookInput((string) $parsed['book']) ?? $parsed['book'];
                $chapter = (int) $parsed['chapter'];
                $verseFilter = $parsed['verses'];

                $chapterData = $this->buildChapterViewData($book, $chapter, $books, $bookCodes, $verseFilter);
                if ($chapterData === null) {
                    $searchError = 'Ayat/pasal tidak ditemukan. Cek kembali kitab, pasal, dan ayat.';
                } else {
                    $selectedBook = $chapterData['selected_book'];
                    $selectedChapter = $chapterData['selected_chapter'];
                    $chapters = $chapterData['chapters'];
                    $chapterLabel = $chapterData['chapter_label'];
                    $verses = $chapterData['verses'];
                    $prevUrl = $chapterData['prev_url'];
                    $nextUrl = $chapterData['next_url'];
                    $searchMeta = $chapterData['search_meta'];
                }
            }
        }

        return Inertia::render('VerseHub/Reader', [
            'lang' => $lang,
            'canonical_url' => url("/versehub/{$lang}"),
            'books' => $books,
            'selected_book' => $selectedBook,
            'selected_chapter' => $selectedChapter,
            'chapters' => $chapters,
            'chapter_label' => $chapterLabel,
            'verses' => $verses,
            'prev_url' => $prevUrl,
            'next_url' => $nextUrl,
            'search_query' => $searchQuery,
            'search_error' => $searchError,
            'search_meta' => $searchMeta,
            'search_recommendations' => $searchRecommendations,
            'cross_panels' => $crossPanels,
            'home_verse' => VerseHubHomeVerse::get('id', self::ID_BOOK_LABELS),
        ]);
    }

    /**
     * Chapter reader page (SEO-friendly).
     * Example: /versehub/id/mat-1
     */
    public function chapter(Request $request, string $chapterRef)
    {
        // Only ID for now.
        $chapterRef = Str::lower(trim($chapterRef));
        $parsedRef = $this->parseChapterRef($chapterRef);
        abort_unless($parsedRef !== null, 404);

        $book = $parsedRef['book'];
        $chapter = $parsedRef['chapter'];
        abort_unless($chapter > 0, 404);

        $bookCodes = $this->availableIdBookCodesCanonical();

        $canonicalBook = $this->resolveIdBookCode($book);
        if ($canonicalBook !== null) {
            $book = $canonicalBook;
        }

        $canonicalRef = sprintf('%s-%d', $book, $chapter);
        if ($chapterRef !== $canonicalRef) {
            return redirect()->to(url("/versehub/id/{$canonicalRef}"), $this->canonicalRedirectCode());
        }

        abort_unless(in_array($book, $bookCodes, true), 404);

        $books = $this->buildIdBooks($bookCodes);
        $chapterData = $this->buildChapterViewData($book, $chapter, $books, $bookCodes);
        abort_unless($chapterData !== null, 404);

        $ogUrl = url("/versehub/id/{$canonicalRef}/og.png");

        return Inertia::render('VerseHub/Reader', [
            'lang' => 'id',
            'canonical_url' => url("/versehub/id/{$book}-{$chapter}"),
            'books' => $books,
            'selected_book' => $chapterData['selected_book'],
            'selected_chapter' => $chapterData['selected_chapter'],
            'chapters' => $chapterData['chapters'],
            'chapter_label' => $chapterData['chapter_label'],
            'verses' => $chapterData['verses'],
            'prev_url' => $chapterData['prev_url'],
            'next_url' => $chapterData['next_url'],
            'search_query' => '',
            'search_error' => null,
            'search_meta' => null,
            'search_recommendations' => [],
            'cross_panels' => [],
            'mentor_insights' => $chapterData['mentor_insights'] ?? null,
            'og_image_url' => $ogUrl,
            'home_verse' => VerseHubHomeVerse::get('id', self::ID_BOOK_LABELS),
        ]);
    }

    /**
     * Generate premium OG for a chapter.
     */
    public function chapterOg(Request $request, string $chapterRef)
    {
        $chapterRef = Str::lower(trim($chapterRef));
        $parsedRef = $this->parseChapterRef($chapterRef);
        abort_unless($parsedRef !== null, 404);

        $book = $parsedRef['book'];
        $chapter = $parsedRef['chapter'];
        abort_unless($chapter > 0, 404);

        $canonicalBook = $this->resolveIdBookCode($book);
        if ($canonicalBook !== null) {
            $book = $canonicalBook;
        }
        $canonicalRef = sprintf('%s-%d', $book, $chapter);
        if ($chapterRef !== $canonicalRef) {
            return redirect()->to(url("/versehub/id/{$canonicalRef}/og.png"), $this->canonicalRedirectCode());
        }

        $bookCodes = $this->availableIdBookCodesCanonical();
        abort_unless(in_array($book, $bookCodes, true), 404);
        $label = self::ID_BOOK_LABELS[$book] ?? Str::upper($book);
        $title = "{$label} {$chapter}";
        $description = "Baca {$label} Pasal {$chapter} di VerseHub Scripture Guide.";

        $controller = new VerseHubController();
        $png = $controller->renderChapterOg($title, $description);

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * JSON endpoint for chapter list (used by picker to avoid full page reload).
     *
     * GET /versehub/id/chapters?book=mat
     */
    public function chapters(Request $request)
    {
        $book = Str::lower(trim((string) $request->query('book', '')));
        $book = $this->resolveIdBookCode($book) ?? $book;
        if ($book === '') {
            return response()->json(['book' => null, 'chapters' => []]);
        }

        $chapters = BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->whereIn('book_code', $this->idBookQueryCodes($book))
            ->distinct()
            ->orderBy('chapter')
            ->pluck('chapter')
            ->map(fn($c) => (int) $c)
            ->all();
        $chapters = $this->normalizeChapterList($book, $chapters);

        return response()->json([
            'book' => $book,
            'chapters' => $chapters,
        ]);
    }

    public function activity(
        Request $request,
        UserMetricsService $metricsService,
        VerseHubActivityService $activityService
    ) {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $validated = $request->validate([
            'tab' => ['nullable', 'in:all,favorites,bookmarks,notes'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:recent,oldest'],
            'per_page' => ['nullable', 'integer', 'in:20,50,100'],
            'cursor' => ['nullable', 'string', 'max:100'],
        ]);

        $tab = (string) ($validated['tab'] ?? 'all');
        $sort = (string) ($validated['sort'] ?? 'recent');
        $queryText = trim((string) ($validated['q'] ?? ''));
        $perPage = (int) ($validated['per_page'] ?? 20);
        $cursorRaw = trim((string) ($validated['cursor'] ?? ''));
        $cursor = $this->parseActivityCursor($cursorRaw);

        $baseQuery = UserVerseAction::query()
            ->where('user_id', $user->id)
            ->where('lang', 'id');

        $totals = [
            'all' => (clone $baseQuery)->where(function ($q) {
                $q->where('favorited', true)
                    ->orWhere('bookmarked', true)
                    ->orWhere(function ($nq) {
                        $nq->whereNotNull('note_text')->where('note_text', '!=', '');
                    });
            })->count(),
            'favorites' => (clone $baseQuery)->where('favorited', true)->count(),
            'bookmarks' => (clone $baseQuery)->where('bookmarked', true)->count(),
            'notes' => (clone $baseQuery)->whereNotNull('note_text')->where('note_text', '!=', '')->count(),
        ];

        $listQuery = clone $baseQuery;
        $this->applyActivityTabFilter($listQuery, $tab);
        $this->applyActivitySearch($listQuery, $queryText);

        if ($sort === 'oldest') {
            $listQuery->orderBy('updated_at')->orderBy('id');
        } else {
            $listQuery->orderByDesc('updated_at')->orderByDesc('id');
        }

        if (is_array($cursor)) {
            $cursorAt = $cursor['updated_at'];
            $cursorId = $cursor['id'];
            $listQuery->where(function ($q) use ($sort, $cursorAt, $cursorId) {
                if ($sort === 'oldest') {
                    $q->where('updated_at', '>', $cursorAt)
                        ->orWhere(function ($nq) use ($cursorAt, $cursorId) {
                            $nq->where('updated_at', '=', $cursorAt)
                                ->where('id', '>', $cursorId);
                        });
                } else {
                    $q->where('updated_at', '<', $cursorAt)
                        ->orWhere(function ($nq) use ($cursorAt, $cursorId) {
                            $nq->where('updated_at', '=', $cursorAt)
                                ->where('id', '<', $cursorId);
                        });
                }
            });
        }

        $rawRows = $listQuery
            ->limit($perPage + 1)
            ->get([
                'id',
                'book_code',
                'chapter',
                'verse',
                'favorited',
                'bookmarked',
                'note_text',
                'updated_at',
            ]);

        $hasMore = $rawRows->count() > $perPage;
        $pageRows = $rawRows->take($perPage)->values();

        $mappedItems = $pageRows->map(function (UserVerseAction $row) {
            $bookCode = Str::lower((string) $row->book_code);
            $chapter = (int) $row->chapter;
            $verse = (int) $row->verse;
            $ref = sprintf('%s-%d:%d', Str::upper($bookCode), $chapter, $verse);
            return [
                'id' => (int) $row->id,
                'ref' => $ref,
                'book' => $bookCode,
                'book_label' => self::ID_BOOK_LABELS[$bookCode] ?? Str::upper($bookCode),
                'chapter' => $chapter,
                'verse' => $verse,
                'chapter_href' => url('/versehub/id/' . sprintf('%s-%d#v%d', $bookCode, $chapter, $verse)),
                'is_favorite' => (bool) $row->favorited,
                'is_bookmark' => (bool) $row->bookmarked,
                'note' => (string) ($row->note_text ?? ''),
                'updated_at' => optional($row->updated_at)?->toIso8601String(),
            ];
        })->values()->all();

        $nextCursor = null;
        if ($hasMore && $pageRows->isNotEmpty()) {
            /** @var UserVerseAction $last */
            $last = $pageRows->last();
            if ($last->updated_at) {
                $nextCursor = $this->buildActivityCursor((string) $last->updated_at->toIso8601String(), (int) $last->id);
            }
        }

        $nowJkt = now('Asia/Jakarta');

        /** @var UserMetric|null $metric */
        $metric = UserMetric::query()->where('user_id', $user->id)->first();
        if (!$metric || !$metric->last_calculated_at || $metric->last_calculated_at->lt($nowJkt->copy()->subHours(12))) {
            $metric = $metricsService->refreshForUser($user, $nowJkt);
        }

        $quoteRow = (clone $baseQuery)
            ->whereNotNull('note_text')
            ->where('note_text', '!=', '')
            ->where('updated_at', '>=', $nowJkt->copy()->subDays(7))
            ->orderByDesc('updated_at')
            ->first(['book_code', 'chapter', 'verse', 'note_text']);
        if (!$quoteRow) {
            $quoteRow = (clone $baseQuery)
                ->whereNotNull('note_text')
                ->where('note_text', '!=', '')
                ->orderByDesc('updated_at')
                ->first(['book_code', 'chapter', 'verse', 'note_text']);
        }
        $quoteOfWeek = is_object($quoteRow) ? trim((string) ($quoteRow->note_text ?? '')) : null;
        if ($quoteOfWeek !== null && mb_strlen($quoteOfWeek) > 180) {
            $quoteOfWeek = mb_substr($quoteOfWeek, 0, 180) . '...';
        }
        $quoteRef = null;
        if (is_object($quoteRow)) {
            $b = Str::lower((string) ($quoteRow->book_code ?? ''));
            $c = (int) ($quoteRow->chapter ?? 0);
            $v = (int) ($quoteRow->verse ?? 0);
            if ($b !== '' && $c > 0 && $v > 0) {
                $quoteRef = sprintf('%s %d:%d', self::ID_BOOK_LABELS[$b] ?? Str::upper($b), $c, $v);
            }
        }

        $groupedRows = $activityService->groupByTimeline($mappedItems, $nowJkt);

        $payload = [
            'tab' => $tab,
            'query' => $queryText,
            'sort' => $sort,
            'per_page' => $perPage,
            'cursor' => $cursorRaw,
            'totals' => $totals,
            'items' => $mappedItems,
            'grouped_rows' => $groupedRows,
            'page' => [
                'has_more' => $hasMore,
                'next_cursor' => $nextCursor,
                'cursor' => $cursorRaw,
            ],
            'activity_stats' => [
                'streak' => (int) ($metric?->streak_days ?? 0),
                'total_saved' => (int) ($metric?->total_saved ?? 0),
                'this_week' => (int) ($metric?->weekly_count ?? 0),
                'growth_percent' => (int) ($metric?->growth_percentage ?? 0),
                'quote_of_week' => $quoteOfWeek,
                'quote_ref' => $quoteRef,
            ],
        ];

        if ($request->expectsJson()) {
            if ($request->query('partial') === '1') {
                return response()->json([
                    'items' => $mappedItems,
                    'page' => $payload['page'],
                ]);
            }

            return response()->json($payload);
        }

        return Inertia::render('VerseHub/Activity', $payload);
    }

    public function publishQuotePost(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $validated = $request->validate([
            'action_id' => ['required', 'integer', 'min:1'],
            'source_tab' => ['nullable', 'in:all,favorites,bookmarks,notes'],
        ]);

        $action = UserVerseAction::query()
            ->where('id', (int) $validated['action_id'])
            ->where('user_id', $user->id)
            ->where('lang', 'id')
            ->first();

        if (!$action) {
            return response()->json(['message' => 'Ayat tidak ditemukan.'], 404);
        }

        $bookCode = Str::lower((string) $action->book_code);
        $chapter = (int) $action->chapter;
        $verse = (int) $action->verse;
        $bookLabel = self::ID_BOOK_LABELS[$bookCode] ?? Str::upper($bookCode);
        $reference = sprintf('%s %d:%d', $bookLabel, $chapter, $verse);
        $refSlug = sprintf('%s-%d-%d', $bookCode, $chapter, $verse);

        $noteText = trim((string) ($action->note_text ?? ''));
        $quoteText = $noteText;
        if ($quoteText === '') {
            $quoteText = (string) (
                BibleVerse::query()
                    ->where('provider', 'ayt')
                    ->where('lang', 'id')
                    ->where('book_code', $bookCode)
                    ->where('chapter', $chapter)
                    ->where('verse', $verse)
                    ->value('text')
            );
            $quoteText = trim($quoteText);
        }
        if ($quoteText === '') {
            $quoteText = 'Ayat ini saya simpan sebagai penguatan iman hari ini.';
        }

        $sourceTab = (string) ($validated['source_tab'] ?? 'all');
        $sourceType = $sourceTab;
        if ($sourceType === 'all') {
            if ($noteText !== '') {
                $sourceType = 'notes';
            } elseif ((bool) $action->bookmarked) {
                $sourceType = 'bookmarks';
            } elseif ((bool) $action->favorited) {
                $sourceType = 'favorites';
            }
        }
        $meta = [
            'reference' => $reference,
            'ref' => $refSlug,
            'source' => $sourceType,
        ];
        $serialized = base64_encode((string) json_encode($meta));
        $storedText = '[vhq:' . $serialized . ']' . $quoteText;

        // Keep one active quote post per user to avoid noise in Today feed.
        MemberPost::query()
            ->where('user_id', $user->id)
            ->where('type', self::ACTIVITY_QUOTE_POST_TYPE)
            ->whereNull('hidden_at')
            ->where('expires_at', '>', now())
            ->update(['expires_at' => now()]);

        $post = MemberPost::query()->create([
            'user_id' => $user->id,
            'type' => self::ACTIVITY_QUOTE_POST_TYPE,
            'text' => $storedText,
            'image_path' => null,
            'thumb_path' => null,
            'expires_at' => now()->addHours(24),
            'hidden_at' => null,
            'hidden_by' => null,
        ]);

        return response()->json([
            'ok' => true,
            'post_id' => $post->id,
            'text' => $quoteText,
            'reference' => $reference,
            'ref' => $refSlug,
            'source' => $sourceType,
            'expires_at' => optional($post->expires_at)?->toIso8601String(),
        ]);
    }

    private function parseActivityCursor(string $raw): ?array
    {
        if ($raw === '' || strlen($raw) > 100) {
            return null;
        }
        $parts = explode('|', $raw, 2);
        if (count($parts) !== 2) {
            return null;
        }

        $updatedAtRaw = trim((string) $parts[0]);
        $idRaw = trim((string) $parts[1]);
        if ($updatedAtRaw === '' || !ctype_digit($idRaw)) {
            return null;
        }

        try {
            $updatedAt = Carbon::parse($updatedAtRaw);
        } catch (\Throwable) {
            return null;
        }

        $id = (int) $idRaw;
        if ($id < 1) {
            return null;
        }

        return [
            'updated_at' => $updatedAt,
            'id' => $id,
        ];
    }

    private function buildActivityCursor(string $updatedAtIso, int $id): string
    {
        return trim($updatedAtIso) . '|' . $id;
    }

    private function applyActivityTabFilter($query, string $tab): void
    {
        if ($tab === 'favorites') {
            $query->where('favorited', true);
            return;
        }
        if ($tab === 'bookmarks') {
            $query->where('bookmarked', true);
            return;
        }
        if ($tab === 'notes') {
            $query->whereNotNull('note_text')->where('note_text', '!=', '');
            return;
        }

        $query->where(function ($q) {
            $q->where('favorited', true)
                ->orWhere('bookmarked', true)
                ->orWhere(function ($nq) {
                    $nq->whereNotNull('note_text')->where('note_text', '!=', '');
                });
        });
    }

    private function applyActivitySearch($query, string $raw): void
    {
        $raw = Str::lower(trim($raw));
        if ($raw === '') {
            return;
        }

        $rawCompact = preg_replace('/\s+/', '', $raw) ?? $raw;
        $parsed = $this->parseReaderReference($raw);
        $bookOnly = $this->resolveReaderBookInput($raw);

        $query->where(function ($q) use ($raw, $rawCompact, $parsed, $bookOnly) {
            $q->where('book_code', 'like', '%' . $rawCompact . '%');

            if (is_string($bookOnly)) {
                $q->orWhere('book_code', $bookOnly);
            }

            if (is_array($parsed)) {
                $book = $this->resolveReaderBookInput((string) ($parsed['book'] ?? ''));
                if (is_string($book)) {
                    $q->orWhere(function ($nq) use ($book, $parsed) {
                        $nq->where('book_code', $book)
                            ->where('chapter', (int) ($parsed['chapter'] ?? 0));

                        $verses = $parsed['verses'] ?? [];
                        if (is_array($verses) && count($verses) > 0) {
                            $nq->whereIn('verse', array_map('intval', $verses));
                        }
                    });
                }
            } elseif (preg_match('/^(?<book>[a-z0-9]+)[\s\-_.:]+(?<chapter>\d+)/i', $raw, $m)) {
                $book = $this->resolveReaderBookInput((string) $m['book']);
                if (is_string($book)) {
                    $q->orWhere(function ($nq) use ($book, $m) {
                        $nq->where('book_code', $book)
                            ->where('chapter', (int) $m['chapter']);
                    });
                }
            }
        });
    }

    private function resolveIdBookCode(string $book): ?string
    {
        $book = Str::lower(trim($book));
        $map = config('versehub_books.id');
        $aliases = config('versehub_books.aliases');

        if (is_array($map) && array_key_exists($book, $map)) {
            return $book;
        }
        if (!is_array($aliases)) {
            return null;
        }
        $alias = $aliases[$book] ?? null;
        if (!is_string($alias)) {
            return null;
        }
        $alias = Str::lower(trim($alias));
        if (is_array($map) && array_key_exists($alias, $map)) {
            return $alias;
        }
        return null;
    }

    private function availableIdBookCodesCanonical(): array
    {
        $rawCodes = BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->distinct()
            ->pluck('book_code')
            ->map(fn($x) => Str::lower((string) $x))
            ->all();

        $canonicalSet = [];
        foreach ($rawCodes as $raw) {
            $canonical = $this->resolveIdBookCode($raw) ?? $raw;
            $canonicalSet[$canonical] = true;
        }

        $codes = array_keys($canonicalSet);
        $orderIdx = array_flip(self::ID_BOOK_ORDER);
        usort($codes, function (string $a, string $b) use ($orderIdx) {
            $ai = $orderIdx[$a] ?? 999;
            $bi = $orderIdx[$b] ?? 999;
            if ($ai === $bi) {
                return strcmp($a, $b);
            }
            return $ai <=> $bi;
        });

        return $codes;
    }

    private function buildIdBooks(array $codes): array
    {
        return array_map(function (string $code) {
            return [
                'code' => $code,
                'label' => self::ID_BOOK_LABELS[$code] ?? Str::upper($code),
                'testament' => in_array($code, self::ID_NT_CODES, true) ? 'nt' : 'ot',
            ];
        }, $codes);
    }

    private function idBookQueryCodes(string $canonicalBook): array
    {
        $canonicalBook = Str::lower(trim($canonicalBook));
        $aliases = config('versehub_books.aliases', []);
        if (!is_array($aliases)) {
            return [$canonicalBook];
        }

        $codes = [$canonicalBook];
        foreach ($aliases as $alias => $target) {
            if (!is_string($alias) || !is_string($target))
                continue;
            if (Str::lower(trim($target)) !== $canonicalBook)
                continue;
            $codes[] = Str::lower(trim($alias));
        }

        return array_values(array_unique($codes));
    }

    private function parseChapterRef(string $raw): ?array
    {
        $s = Str::lower(trim($raw));
        if ($s === '') {
            return null;
        }

        // Accept canonical and minor variants:
        // - 1ptr-3
        // - 1ptr_3
        // - 1ptr.3
        if (preg_match('/^(?<book>[a-z0-9]+)[\-_.](?<ch>\d+)$/', $s, $m)) {
            return [
                'book' => (string) $m['book'],
                'chapter' => (int) $m['ch'],
            ];
        }

        // Accept compact variant: 1ptr3 -> 1ptr-3
        if (preg_match('/^(?<book>[a-z0-9]*[a-z])(?<ch>\d+)$/', $s, $m)) {
            return [
                'book' => (string) $m['book'],
                'chapter' => (int) $m['ch'],
            ];
        }

        return null;
    }

    private function parseReaderReference(string $raw): ?array
    {
        $s = Str::lower(trim($raw));
        if ($s === '') {
            return null;
        }

        $s = str_replace(['–', '—', '_', '.'], ['-', '-', '-', '-'], $s);
        $s = preg_replace('/\s+/', ' ', $s) ?? $s;
        $s = trim($s);

        if (preg_match('/^(?<book>[a-z0-9 ]+)\s+(?<ch>\d+)\s*:\s*(?<verses>[\d,\-\s]+)$/', $s, $m)) {
            $verses = $this->parseVerseExpression((string) $m['verses']);
            if ($verses === null)
                return null;
            return ['book' => (string) $m['book'], 'chapter' => (int) $m['ch'], 'verses' => $verses];
        }

        if (preg_match('/^(?<book>[a-z0-9]*[a-z])(?<ch>\d+)\s*:\s*(?<verses>[\d,\-\s]+)$/', $s, $m)) {
            $verses = $this->parseVerseExpression((string) $m['verses']);
            if ($verses === null)
                return null;
            return ['book' => (string) $m['book'], 'chapter' => (int) $m['ch'], 'verses' => $verses];
        }

        if (preg_match('/^(?<book>[a-z0-9]+)-(?<ch>\d+)-(?<verses>[\d,\-\s]+)$/', $s, $m)) {
            $verses = $this->parseVerseExpression((string) $m['verses']);
            if ($verses === null)
                return null;
            return ['book' => (string) $m['book'], 'chapter' => (int) $m['ch'], 'verses' => $verses];
        }

        if (preg_match('/^(?<book>[a-z0-9]*[a-z])(?<ch>\d+)-(?<verses>[\d,\-\s]+)$/', $s, $m)) {
            $verses = $this->parseVerseExpression((string) $m['verses']);
            if ($verses === null)
                return null;
            return ['book' => (string) $m['book'], 'chapter' => (int) $m['ch'], 'verses' => $verses];
        }

        // Natural input: "kejadian 1", "1 petrus 3"
        if (preg_match('/^(?<book>[a-z0-9 ]+)\s+(?<ch>\d+)$/', $s, $m)) {
            return [
                'book' => (string) $m['book'],
                'chapter' => (int) $m['ch'],
                'verses' => [],
            ];
        }

        $chapterRef = $this->parseChapterRef($s);
        if ($chapterRef !== null) {
            return [
                'book' => $chapterRef['book'],
                'chapter' => (int) $chapterRef['chapter'],
                'verses' => [],
            ];
        }

        return null;
    }

    private function parseCrossChapterReference(string $raw): ?array
    {
        $s = Str::lower(trim($raw));
        if ($s === '') {
            return null;
        }

        $s = str_replace(['–', '—', '_', '.'], ['-', '-', '-', '-'], $s);
        $s = preg_replace('/\s+/', ' ', $s) ?? $s;
        $s = trim($s);

        if (!preg_match('/^(?<book>[a-z0-9 ]+)\s+(?<ch1>\d+)\s*:\s*(?<v1>\d+)\s*-\s*(?<ch2>\d+)\s*:\s*(?<v2>\d+)$/', $s, $m)) {
            return null;
        }

        return [
            'book' => (string) $m['book'],
            'chapter_start' => (int) $m['ch1'],
            'verse_start' => (int) $m['v1'],
            'chapter_end' => (int) $m['ch2'],
            'verse_end' => (int) $m['v2'],
        ];
    }

    private function parseVerseExpression(string $raw): ?array
    {
        $expr = preg_replace('/\s+/', '', $raw) ?? '';
        if ($expr === '') {
            return null;
        }

        $verses = [];
        $parts = explode(',', $expr);
        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }

            if (preg_match('/^(?<v>\d+)$/', $part, $m)) {
                $v = (int) $m['v'];
                if ($v < 1)
                    return null;
                $verses[] = $v;
                continue;
            }

            if (preg_match('/^(?<a>\d+)-(?<b>\d+)$/', $part, $m)) {
                $a = (int) $m['a'];
                $b = (int) $m['b'];
                if ($a < 1 || $b < 1)
                    return null;
                if ($a > $b) {
                    [$a, $b] = [$b, $a];
                }
                // Soft guard to avoid overly heavy ranges.
                if (($b - $a) > 400)
                    return null;
                for ($i = $a; $i <= $b; $i++) {
                    $verses[] = $i;
                }
                continue;
            }

            return null;
        }

        $verses = array_values(array_unique(array_map('intval', $verses)));
        sort($verses);
        return $verses;
    }

    private function buildCrossChapterRecommendations(array $cross, array $books, array $bookCodes): array
    {
        $book = $this->resolveReaderBookInput((string) ($cross['book'] ?? ''));
        if (!is_string($book) || !in_array($book, $bookCodes, true)) {
            return [];
        }

        $ch1 = (int) ($cross['chapter_start'] ?? 0);
        $v1 = (int) ($cross['verse_start'] ?? 0);
        $ch2 = (int) ($cross['chapter_end'] ?? 0);
        $v2 = (int) ($cross['verse_end'] ?? 0);
        if ($ch1 < 1 || $v1 < 1 || $ch2 < 1 || $v2 < 1 || $ch2 < $ch1) {
            return [];
        }

        $queryCodes = $this->idBookQueryCodes($book);
        $bookLabel = Arr::first($books, fn($b) => $b['code'] === $book)['label'] ?? Str::upper($book);

        $maxV1 = (int) BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->whereIn('book_code', $queryCodes)
            ->where('chapter', $ch1)
            ->max('verse');

        $maxV2 = (int) BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->whereIn('book_code', $queryCodes)
            ->where('chapter', $ch2)
            ->max('verse');

        if ($maxV1 < 1 || $maxV2 < 1) {
            return [];
        }

        $startStart = min(max($v1, 1), $maxV1);
        $startEnd = $maxV1;
        $secondEnd = min(max($v2, 1), $maxV2);

        $suggestions = [];
        $suggestions[] = [
            'label' => sprintf('%s %d:%d-%d', $bookLabel, $ch1, $startStart, $startEnd),
            'href' => url('/versehub/id?q=' . rawurlencode(sprintf('%s %d:%d-%d', $book, $ch1, $startStart, $startEnd))),
        ];
        $suggestions[] = [
            'label' => sprintf('%s %d:%d-%d', $bookLabel, $ch2, 1, $secondEnd),
            'href' => url('/versehub/id?q=' . rawurlencode(sprintf('%s %d:%d-%d', $book, $ch2, 1, $secondEnd))),
        ];

        if ($ch1 !== $ch2) {
            $suggestions[] = [
                'label' => sprintf('Buka pasal %s %d', $bookLabel, $ch1),
                'href' => url('/versehub/id/' . $book . '-' . $ch1),
            ];
            $suggestions[] = [
                'label' => sprintf('Buka pasal %s %d', $bookLabel, $ch2),
                'href' => url('/versehub/id/' . $book . '-' . $ch2),
            ];
        }

        return $suggestions;
    }

    private function buildCrossChapterPanels(array $cross, array $books, array $bookCodes): array
    {
        $book = $this->resolveReaderBookInput((string) ($cross['book'] ?? ''));
        if (!is_string($book) || !in_array($book, $bookCodes, true)) {
            return [];
        }

        $ch1 = (int) ($cross['chapter_start'] ?? 0);
        $v1 = (int) ($cross['verse_start'] ?? 0);
        $ch2 = (int) ($cross['chapter_end'] ?? 0);
        $v2 = (int) ($cross['verse_end'] ?? 0);
        if ($ch1 < 1 || $v1 < 1 || $ch2 < 1 || $v2 < 1 || $ch2 < $ch1) {
            return [];
        }

        $queryCodes = $this->idBookQueryCodes($book);
        $maxV1 = (int) BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->whereIn('book_code', $queryCodes)
            ->where('chapter', $ch1)
            ->max('verse');
        $maxV2 = (int) BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->whereIn('book_code', $queryCodes)
            ->where('chapter', $ch2)
            ->max('verse');
        if ($maxV1 < 1 || $maxV2 < 1) {
            return [];
        }

        $firstFilter = range(min(max($v1, 1), $maxV1), $maxV1);
        $secondFilter = range(1, min(max($v2, 1), $maxV2));

        $first = $this->buildChapterViewData($book, $ch1, $books, $bookCodes, $firstFilter);
        $second = $this->buildChapterViewData($book, $ch2, $books, $bookCodes, $secondFilter);
        if ($first === null || $second === null) {
            return [];
        }

        return [
            [
                'title' => $first['chapter_label'],
                'verses' => $first['verses'],
                'range_text' => $ch1 === $ch2
                    ? sprintf('%d:%d-%d', $ch1, min($firstFilter), max($firstFilter))
                    : sprintf('%d:%d-%d', $ch1, min($firstFilter), $maxV1),
            ],
            [
                'title' => $second['chapter_label'],
                'verses' => $second['verses'],
                'range_text' => sprintf('%d:%d-%d', $ch2, 1, max($secondFilter)),
            ],
        ];
    }

    private function buildChapterViewData(
        string $book,
        int $chapter,
        array $books,
        array $bookCodes,
        array $verseFilter = []
    ): ?array {
        if ($chapter < 1 || !in_array($book, $bookCodes, true)) {
            return null;
        }

        $queryCodes = $this->idBookQueryCodes($book);

        $chapters = BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->whereIn('book_code', $queryCodes)
            ->distinct()
            ->orderBy('chapter')
            ->pluck('chapter')
            ->map(fn($c) => (int) $c)
            ->all();
        $chapters = $this->normalizeChapterList($book, $chapters);

        if (!in_array($chapter, $chapters, true)) {
            return null;
        }

        $bookLabel = Arr::first($books, fn($b) => $b['code'] === $book)['label'] ?? Str::upper($book);
        $chapterLabel = $bookLabel . ' ' . $chapter;

        $verses = BibleVerse::query()
            ->select(['verse', 'text'])
            ->where('provider', 'ayt')
            ->where('lang', 'id')
            ->whereIn('book_code', $queryCodes)
            ->where('chapter', $chapter)
            ->orderBy('verse')
            ->get()
            ->map(function (BibleVerse $v) use ($book, $chapter) {
                $verseNumber = (int) $v->verse;
                $ref = sprintf('%s-%d-%d', $book, $chapter, $verseNumber);
                return [
                    'verse' => $verseNumber,
                    'text' => (string) $v->text,
                    'href' => url('/versehub/id/' . $ref),
                    'key' => $ref,
                ];
            })
            ->all();

        $searchMeta = null;
        if ($verseFilter !== []) {
            $allowed = array_flip(array_map('intval', $verseFilter));
            $verses = array_values(array_filter(
                $verses,
                fn(array $v) => isset($allowed[(int) ($v['verse'] ?? 0)])
            ));
            if ($verses === []) {
                return null;
            }
            $searchMeta = [
                'type' => 'verse_filter',
                'verses' => array_values(array_map('intval', $verseFilter)),
            ];
        }

        $prevUrl = null;
        $nextUrl = null;
        $idx = array_search($chapter, $chapters, true);
        if (is_int($idx)) {
            $prev = $chapters[$idx - 1] ?? null;
            $next = $chapters[$idx + 1] ?? null;
            if (is_int($prev) && $prev > 0)
                $prevUrl = url("/versehub/id/{$book}-{$prev}");
            if (is_int($next) && $next > 0)
                $nextUrl = url("/versehub/id/{$book}-{$next}");
        }

        return [
            'selected_book' => $book,
            'selected_chapter' => $chapter,
            'chapters' => $chapters,
            'chapter_label' => $chapterLabel,
            'verses' => $verses,
            'prev_url' => $prevUrl,
            'next_url' => $nextUrl,
            'search_meta' => $searchMeta,
            'reflection_question' => $this->getChapterReflection($book, $chapter),
            'has_reflected' => $this->hasUserReflected($book, $chapter),
            'mentor_insights' => $this->getChapterMentorInsights($book, $chapter),
        ];
    }

    private function normalizeChapterList(string $book, array $chapters): array
    {
        $book = Str::lower(trim($book));
        $normalized = array_values(array_unique(array_filter(
            array_map('intval', $chapters),
            fn(int $chapter) => $chapter > 0
        )));
        sort($normalized);

        $maxDetected = $normalized !== [] ? max($normalized) : 0;
        $maxKnown = self::ID_BOOK_CHAPTER_TOTALS[$book] ?? 0;
        $maxChapter = max($maxDetected, $maxKnown);

        return $maxChapter > 0 ? range(1, $maxChapter) : [];
    }

    private function getChapterMentorInsights(string $book, int $chapter): array
    {
        $mentor = app(VerseHubMentorService::class);
        $insights = $mentor->getGuidedInsights($book, $chapter, 1);

        $ref = sprintf('%s-%d-1', $book, $chapter);

        return [
            'theme_connections' => $insights['theme_connections'] ?? [],
            'historical_context' => $insights['historical_context'] ?? null,
            'relationships' => $mentor->getRelationships($ref),
            'themes' => $mentor->getThemes($ref),
            'suggested_paths' => $mentor->getActiveStudyPaths(auth()->user(), $ref),
        ];
    }

    private function getChapterReflection(string $book, int $chapter): string
    {
        $mentor = app(VerseHubMentorService::class);
        $insights = $mentor->getGuidedInsights($book, $chapter, 1); // Use verse 1 as proxy for chapter context
        return $insights['reflection_questions'][0] ?? 'Bagaimana ayat-ayat ini menguatkan imanmu hari ini?';
    }

    private function hasUserReflected(string $book, int $chapter): bool
    {
        $user = auth()->user();
        if (!$user)
            return false;

        $ref = sprintf('%s-%d', $book, $chapter);
        return ReflectionResponse::where('user_id', $user->id)
            ->where('verse_ref', 'like', $ref . '%')
            ->exists();
    }

    private function canonicalRedirectCode(): int
    {
        return app()->environment('local') ? 302 : 301;
    }

    private function resolveReaderBookInput(string $raw): ?string
    {
        $token = Str::lower(trim($raw));
        if ($token === '')
            return null;

        $byCode = $this->resolveIdBookCode($token);
        if (is_string($byCode)) {
            return $byCode;
        }

        foreach (self::ID_BOOK_LABELS as $code => $label) {
            $norm = Str::lower(trim($label));
            if ($token === $norm || Str::startsWith($norm, $token) || Str::contains($norm, $token)) {
                $canonical = $this->resolveIdBookCode($code) ?? $code;
                return is_string($canonical) ? $canonical : $code;
            }
        }

        return null;
    }
}
