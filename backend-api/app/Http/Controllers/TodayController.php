<?php

namespace App\Http\Controllers;

use App\Http\Resources\FeedItemResource;
use App\Models\FeedItem;
use App\Models\MemberPost;
use App\Services\VerseHubDailyService;
use App\Support\VerseHubHomeVerse;
use App\Support\VerseHubWelcomeVerse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TodayController extends Controller
{
    public function index(VerseHubDailyService $dailyService, \App\Services\TodayFeedService $feedService): Response
    {
        $now = Carbon::now();
        $today = Carbon::today();
        $user = Auth::user();

        // Get new Engagement Engine data
        $engineData = $feedService->getTodayData($user);

        // Legacy quarter/lesson source
        $pinnedLesson = null;
        $quarterProgressPercent = 0;

        $feed = FeedItem::query()
            ->where(function ($q) use ($now) {
                $q->whereNull('visible_from')->orWhere('visible_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('visible_until')->orWhere('visible_until', '>=', $now);
            })
            ->orderByDesc('priority')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        // Activity Quote
        $activityQuotePost = MemberPost::query()
            ->whereNull('hidden_at')
            ->where('type', 'versehub_activity_quote')
            ->where('expires_at', '>', $now)
            ->latest('created_at')
            ->first();

        $activityQuote = null;
        if ($activityQuotePost) {
            $rawText = trim((string) ($activityQuotePost->text ?? ''));
            $text = $rawText;
            $reference = null;
            $ref = null;
            $source = null;
            if (preg_match('/^\[vhq:([A-Za-z0-9+\/=]+)\](.*)$/s', $rawText, $m)) {
                $decoded = base64_decode((string) $m[1], true);
                if ($decoded !== false) {
                    $meta = json_decode($decoded, true);
                    if (is_array($meta)) {
                        $reference = isset($meta['reference']) ? (string) $meta['reference'] : null;
                        $ref = isset($meta['ref']) ? (string) $meta['ref'] : null;
                        $source = isset($meta['source']) ? (string) $meta['source'] : null;
                    }
                }
                $text = trim((string) $m[2]);
            }
            if ($text !== '') {
                $activityQuote = [
                    'text' => $text,
                    'author' => $activityQuotePost->user?->name,
                    'reference' => $reference,
                    'ref' => $ref,
                    'source' => $source,
                ];
            }
        }

        $dailyVerse = $dailyService->getTodayDailyVerse($today, 'id');
        $homeVerse = VerseHubHomeVerse::get('id', \App\Http\Controllers\VerseHubReaderController::ID_BOOK_LABELS);
        $welcomeVerse = VerseHubWelcomeVerse::get(
            'id',
            \App\Http\Controllers\VerseHubReaderController::ID_BOOK_LABELS,
            [
                $homeVerse['ref'] ?? null,
                $dailyVerse['ref'] ?? null,
            ],
        );

        $dailyVersePostProp = $dailyVerse ? [
            'id' => $dailyVerse['source_post_id'],
            'title' => $dailyVerse['title'] ?: ($dailyVerse['reference'] ?? 'Daily Verse'),
            'content' => null,
            'excerpt' => $dailyVerse['quote'],
            'meta' => [
                'book_code' => $dailyVerse['book_code'],
                'chapter' => $dailyVerse['chapter'],
                'verse' => $dailyVerse['verse'],
                'quote' => $dailyVerse['quote'],
                'cta_label' => $dailyVerse['cta_label'],
                'cta_href' => $dailyVerse['cta_href'],
            ],
        ] : null;

        return Inertia::render('Today/Index', [
            // New Engagement Engine Props
            'rituals' => $engineData['rituals'],
            'hybridFeed' => $engineData['feed'],

            // Backward compatibility props
            'pinnedLesson' => $pinnedLesson,
            'feed' => FeedItemResource::collection($feed),
            'posts' => $engineData['feed'], // Overriding with the unified feed
            'dailyVerse' => $dailyVerse,
            'welcomeVerse' => $welcomeVerse,
            'dailyVersePost' => $dailyVersePostProp,
            'homeVerse' => $homeVerse,
            'activityQuote' => $activityQuote,
            'meta' => [
                'current_streak' => 0,
                'quarter_progress_percent' => $quarterProgressPercent,
                'now' => $now->toISOString(),
                'feed_type' => 'today',
                'pagination_ready' => [
                    'limit' => 20,
                ],
            ],
        ]);
    }
}
