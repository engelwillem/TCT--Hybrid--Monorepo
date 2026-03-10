<?php

namespace App\Services;

use App\Models\MemberPost;
use App\Models\User;
use App\Enums\ReactionType;
use App\Services\Content\DailyContentService;
use App\Services\Engagement\FeedComposerService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class TodayFeedService
{
    public function __construct(
        protected DailyContentService $dailyContentService,
        protected FeedComposerService $feedComposerService
    ) {
    }

    /**
     * Get all data required for the Today dashboard.
     */
    public function getTodayData(?User $user = null): array
    {
        $now = Carbon::now();
        $rituals = $this->dailyContentService->getRitualsForDate($now);

        // Collect verse refs from rituals to avoid redundancy in feed
        $ritualVerseRefs = $rituals->map(function ($item) {
            return $item->payload['verse_ref'] ?? $item->payload['ref'] ?? null;
        })->filter()->values()->toArray();

        return [
            'rituals' => $rituals->keyBy(fn($item) => $item->content_type->value)
                ->map(fn($item) => $item->payload),
            'feed' => $this->getHybridFeed($user, $now, $ritualVerseRefs),
        ];
    }

    /**
     * Get the hybrid community feed.
     */
    protected function getHybridFeed(?User $user, Carbon $now, array $excludedVerseRefs = []): Collection
    {
        $fetchLimit = 100; // Fetch more for ranking & variety interleaving
        $displayLimit = 20;

        $rawItems = MemberPost::query()
            ->active()
            ->with(['user:id,name,avatar_path'])
            ->withCount([
                'comments',
                'bookmarks',
                'reactions as pray_count' => fn($q) => $q->where('type', ReactionType::PRAY),
            ])
            ->withExists([
                'reactions as is_prayed_by_me' => fn($q) => $q
                    ->where('type', ReactionType::PRAY)
                    ->where('user_id', $user?->id ?? 0),
                'bookmarks as is_bookmarked_by_me' => fn($q) => $q
                    ->where('user_id', $user?->id ?? 0),
            ])
            ->orderByDesc('created_at')
            ->limit($fetchLimit)
            ->get();

        // FeedComposerService handles the smart ranking and variety guard
        $finalItems = $this->feedComposerService->compose($rawItems, $displayLimit, $excludedVerseRefs);

        return $finalItems->map(fn(MemberPost $p) => $this->formatFeedItem($p, $user));
    }

    /**
     * Format a member post for the unified feed.
     */
    protected function formatFeedItem(MemberPost $p, ?User $user): array
    {
        return [
            'id' => $p->id,
            'type' => $p->type->value,
            'type_label' => $p->type->label(),
            'title' => $p->title,
            'text' => $p->text,
            'image_path' => $p->image_path,
            'thumb_path' => $p->thumb_path,
            'media_paths' => is_array($p->media_paths) ? $p->media_paths : ((is_array($p->metadata) && isset($p->metadata['media_paths']) && is_array($p->metadata['media_paths'])) ? $p->metadata['media_paths'] : []),
            'metadata' => $p->metadata,
            'created_at' => $p->created_at?->toISOString(),
            'author' => [
                'id' => $p->user?->id,
                'name' => $p->user?->name,
                'avatar_url' => $p->user?->getFilamentAvatarUrl(),
                'is_official' => (bool) ($p->user?->isSystemAccount() ?? false),
            ],
            'stats' => [
                'pray_count' => (int) ($p->pray_count ?? 0),
                'comments_count' => (int) ($p->comments_count ?? 0),
                'bookmarks_count' => (int) ($p->bookmarks_count ?? 0),
            ],
            'interactions' => [
                'is_prayed' => (bool) ($p->is_prayed_by_me ?? false),
                'is_bookmarked' => (bool) ($p->is_bookmarked_by_me ?? false),
            ],
            'is_featured' => $p->isFeatured(),
            'can_moderate' => (bool) ($user?->is_admin ?? false),
        ];
    }
}


