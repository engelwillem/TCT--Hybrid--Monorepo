<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MemberPost;
use App\Services\VerseHubDailyService;
use App\Support\VerseHubHomeVerse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class TodayApiController extends Controller
{
    public function show(VerseHubDailyService $dailyService): JsonResponse
    {
        $dailyVerse = $dailyService->getTodayDailyVerse(Carbon::today(), 'id');
        if (!$dailyVerse) {
            $fallback = VerseHubHomeVerse::get('id', []);
            $dailyVerse = $fallback ? [
                'ref' => $fallback['ref'] ?? null,
                'reference' => $fallback['reference'] ?? null,
                'quote' => $fallback['text'] ?? null,
                'cta_label' => 'Baca Alkitab',
                'cta_href' => $fallback['href'] ?? null,
            ] : null;
        }

        $highlights = MemberPost::query()
            ->active()
            ->with(['user:id,name,avatar_path'])
            ->withCount([
                'comments',
                'bookmarks',
                'reactions as pray_count' => fn($q) => $q->where('type', 'pray'),
            ])
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(fn(MemberPost $post) => $this->serializePost($post))
            ->values();

        return response()->json([
            'data' => [
                'dailyVerse' => $dailyVerse,
                'highlights' => $highlights,
            ],
        ]);
    }

    private function serializePost(MemberPost $post): array
    {
        return [
            'id' => (string) $post->id,
            'text' => (string) ($post->text ?? ''),
            'imageUrl' => $post->image_path,
            'createdAt' => $post->created_at?->diffForHumans(),
            'author' => [
                'id' => (string) ($post->user?->id ?? ''),
                'name' => (string) ($post->user?->name ?? 'Member'),
                'avatarUrl' => $post->user?->getFilamentAvatarUrl(),
            ],
            'counts' => [
                'likes' => (int) ($post->pray_count ?? 0),
                'comments' => (int) ($post->comments_count ?? 0),
                'bookmarks' => (int) ($post->bookmarks_count ?? 0),
            ],
            'isLiked' => false,
            'isBookmarked' => false,
        ];
    }
}
