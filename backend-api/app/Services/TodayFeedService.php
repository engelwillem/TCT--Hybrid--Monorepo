<?php

namespace App\Services;

use App\Enums\ReactionType;
use App\Models\MemberPost;
use App\Models\User;
use App\Services\Content\DailyContentService;
use App\Services\Engagement\FeedComposerService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

use function filter_var;
use function parse_url;
use function rawurlencode;

use const FILTER_VALIDATE_URL;
use const PHP_URL_PATH;

class TodayFeedService
{
    public function __construct(
        protected DailyContentService $dailyContentService,
        protected FeedComposerService $feedComposerService
    ) {}

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
            'rituals' => $rituals->keyBy(fn ($item) => $item->content_type->value)
                ->map(fn ($item) => $item->payload),
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
                'reactions as pray_count' => fn ($q) => $q->where('type', ReactionType::PRAY),
            ])
            ->withExists([
                'reactions as is_prayed_by_me' => fn ($q) => $q
                    ->where('type', ReactionType::PRAY)
                    ->where('user_id', $user?->id ?? 0),
                'bookmarks as is_bookmarked_by_me' => fn ($q) => $q
                    ->where('user_id', $user?->id ?? 0),
            ])
            ->orderByDesc('created_at')
            ->limit($fetchLimit)
            ->get();

        // FeedComposerService handles the smart ranking and variety guard
        $finalItems = $this->feedComposerService->compose($rawItems, $displayLimit, $excludedVerseRefs);

        return $finalItems->map(fn (MemberPost $p) => $this->formatFeedItem($p, $user));
    }

    /**
     * Format a member post for the unified feed.
     */
    protected function formatFeedItem(MemberPost $p, ?User $user): array
    {
        return [
            'id' => (string) $p->id,
            'type' => $p->type->value,
            'type_label' => $p->type->label(),
            'title' => $p->title,
            'text' => $p->text ?? '',
            'imageUrl' => $this->communityMediaUrl($p->image_path),
            'thumbPath' => $this->communityMediaUrl($p->thumb_path),
            'mediaPaths' => collect(is_array($p->media_paths)
                ? $p->media_paths
                : ((is_array($p->metadata) && isset($p->metadata['media_paths']) && is_array($p->metadata['media_paths']))
                    ? $p->metadata['media_paths']
                    : []))
                ->map(fn ($item) => $this->communityMediaUrl(is_string($item) ? $item : null))
                ->filter()
                ->values()
                ->all(),
            'metadata' => $p->metadata,
            'createdAt' => $p->created_at?->diffForHumans(),
            'author' => [
                'id' => (string) ($p->user?->id ?? ''),
                'name' => (string) ($p->user?->name ?? 'Member'),
                'avatarUrl' => $p->user?->getFilamentAvatarUrl(),
                'isOfficial' => (bool) ($p->user?->isSystemAccount() ?? false),
            ],
            'counts' => [
                'likes' => (int) ($p->pray_count ?? 0),
                'comments' => (int) ($p->comments_count ?? 0),
                'bookmarks' => (int) ($p->bookmarks_count ?? 0),
            ],
            'isLiked' => (bool) ($p->is_prayed_by_me ?? false),
            'isBookmarked' => (bool) ($p->is_bookmarked_by_me ?? false),
            'isFeatured' => $p->isFeatured(),
            'can_moderate' => (bool) ($user?->is_admin ?? false),
        ];
    }

    protected function communityMediaUrl(?string $value): ?string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') {
            return null;
        }

        $relativePath = $this->normalizeStoredMediaPath($raw);
        if ($relativePath === null) {
            return $raw;
        }

        return url('/api/v1/community/media/'.implode('/', array_map('rawurlencode', explode('/', $relativePath))));
    }

    protected function normalizeStoredMediaPath(?string $value): ?string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') {
            return null;
        }

        if (filter_var($raw, FILTER_VALIDATE_URL)) {
            $parsedPath = parse_url($raw, PHP_URL_PATH);
            if (! is_string($parsedPath) || $parsedPath === '') {
                return null;
            }
            $raw = $parsedPath;
        }

        $normalized = '/'.ltrim($raw, '/');

        if (str_starts_with($normalized, '/storage/')) {
            $normalized = substr($normalized, strlen('/storage/'));
        } else {
            $normalized = ltrim($normalized, '/');
        }

        $normalized = trim($normalized, '/');
        if ($normalized === '' || str_contains($normalized, '..')) {
            return null;
        }

        return $normalized;
    }
}
