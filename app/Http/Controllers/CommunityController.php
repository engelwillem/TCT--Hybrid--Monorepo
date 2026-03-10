<?php

namespace App\Http\Controllers;

use App\Enums\ReactionType;
use App\Models\Channel;
use App\Models\MemberPost;
use App\Support\AppSettings;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function index(\App\Services\TodayFeedService $feedService): Response
    {
        $user = Auth::user();
        $feedData = $feedService->getTodayData($user);

        $now = Carbon::now();
        $archivePosts = MemberPost::query()
            ->whereNull('hidden_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
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
            ->orderByDesc('expires_at')
            ->orderByDesc('created_at')
            ->limit(120)
            ->get()
            ->map(fn(MemberPost $p) => $this->serializeArchivePost($p, $user));

        return Inertia::render('Community/Index', [
            'posts' => $feedData['feed'],
            'archivePosts' => $archivePosts,
            'rituals' => $feedData['rituals'],
            'channels' => Channel::query()
                ->whereIn('slug', ['god-first', 'faith-journey', 'family', 'public-post'])
                ->orderBy('title')
                ->get(['id', 'slug', 'title']),
            'meta' => [
                'now' => $now->toISOString(),
                'feed_type' => 'community',
            ],
        ]);
    }

    private function serializeArchivePost(MemberPost $p, $user): array
    {
        $mediaPaths = $this->resolveMediaPaths($p);

        return [
            'id' => $p->id,
            'type' => $p->type->value,
            'type_label' => $p->type->label(),
            'text' => $p->text,
            'image_path' => $p->image_path,
            'thumb_path' => $p->thumb_path,
            'media_paths' => $mediaPaths,
            'created_at' => $p->created_at?->toISOString(),
            'expires_at' => $p->expires_at?->toISOString(),
            'author' => [
                'id' => $p->user?->id,
                'name' => $p->user?->name,
                'avatar_url' => $p->user?->getFilamentAvatarUrl(),
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
            'can_moderate' => (bool) ($user?->is_admin ?? false),
        ];
    }

    public function share(MemberPost $memberPost): View
    {
        abort_if($memberPost->hidden_at !== null, 404);

        $memberPost->loadMissing('user:id,name');

        $authorName = trim((string) ($memberPost->user?->name ?? 'Member'));
        $text = trim((string) ($memberPost->text ?? ''));
        $title = $authorName !== '' ? "{$authorName} • Community Post" : 'Community Post';

        $description = $text !== ''
            ? Str::limit(preg_replace('/\s+/', ' ', $text) ?? $text, 220)
            : 'Lihat post terbaru di Community TheChosenTalks.';

        $shareUrl = route('community.posts.share', ['memberPost' => $memberPost->id]);
        $openUrl = url('/community#post-' . $memberPost->id);
        $imageUrl = $this->resolveShareImageUrl($memberPost);

        return view('community.share', [
            'post' => $memberPost,
            'title' => $title,
            'description' => $description,
            'share_url' => $shareUrl,
            'open_url' => $openUrl,
            'image_url' => $imageUrl,
        ]);
    }

    private function resolveShareImageUrl(MemberPost $post): string
    {
        $mediaPaths = $this->resolveMediaPaths($post);
        $candidate = (string) ($mediaPaths[0] ?? $post->thumb_path ?: $post->image_path ?: '');
        $candidate = trim($candidate);

        if ($candidate !== '') {
            if (preg_match('/^https?:\/\//i', $candidate)) {
                return $candidate;
            }
            if (str_starts_with($candidate, '/')) {
                return url($candidate);
            }
            if (str_starts_with($candidate, 'storage/')) {
                return url('/' . $candidate);
            }

            return url('/storage/' . ltrim($candidate, '/'));
        }

        return AppSettings::get(
            'site.og_community_image_url',
            AppSettings::get('site.og_image_url', url('/og/versehub-bg.png'))
        );
    }

    private function resolveMediaPaths(MemberPost $post): array
    {
        if (is_array($post->media_paths) && $post->media_paths !== []) {
            return array_values(array_filter(array_map('strval', $post->media_paths)));
        }

        $metaPaths = is_array($post->metadata) && isset($post->metadata['media_paths']) && is_array($post->metadata['media_paths'])
            ? $post->metadata['media_paths']
            : [];

        if ($metaPaths !== []) {
            return array_values(array_filter(array_map('strval', $metaPaths)));
        }

        if (filled($post->image_path)) {
            return [(string) $post->image_path];
        }

        return [];
    }
}
