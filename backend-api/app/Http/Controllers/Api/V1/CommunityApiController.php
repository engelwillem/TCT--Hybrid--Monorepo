<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MemberPost;
use App\Models\MemberPostBookmark;
use App\Models\MemberPostComment;
use App\Models\User;
use App\Services\Interaction\SpiritualInteractionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CommunityApiController extends Controller
{
    public function __construct(
        private readonly SpiritualInteractionService $interactionService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('sanctum')->user();
        $limit = max(1, min(50, (int) $request->integer('limit', 20)));

        $posts = MemberPost::query()
            ->active()
            ->with(['user:id,name,avatar_path'])
            ->withCount([
                'comments',
                'bookmarks',
                'reactions as pray_count' => fn($q) => $q->where('type', 'pray'),
            ])
            ->withExists([
                'reactions as is_prayed_by_me' => fn($q) => $q
                    ->where('type', 'pray')
                    ->where('user_id', $user?->id ?? 0),
                'bookmarks as is_bookmarked_by_me' => fn($q) => $q
                    ->where('user_id', $user?->id ?? 0),
            ])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn(MemberPost $post) => $this->serializePost($post))
            ->values();

        return response()->json([
            'data' => [
                'posts' => $posts,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('sanctum')->user();
        abort_unless($user, 401);

        $validated = $request->validate([
            'text' => ['required_without:images', 'nullable', 'string', 'max:5000'],
            'type' => ['nullable', 'string', 'in:user_post,prayer_request,reflection,testimony'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'imageUrl' => ['nullable', 'url', 'max:2048'], // For backward compatibility
        ]);

        $mediaPaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('community/posts', 'public');
                $mediaPaths[] = Storage::disk('public')->url($path);
            }
        }

        // If no files but imageUrl provided
        if (empty($mediaPaths) && $request->filled('imageUrl')) {
            $mediaPaths[] = $request->input('imageUrl');
        }

        $post = MemberPost::query()->create([
            'user_id' => $user->id,
            'type' => $validated['type'] ?? 'user_post',
            'text' => trim((string) ($validated['text'] ?? '')),
            'image_path' => $mediaPaths[0] ?? null,
            'media_paths' => !empty($mediaPaths) ? $mediaPaths : null,
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        $fresh = $this->reloadPost($post->id, $user->id);

        return response()->json([
            'data' => [
                'post' => $this->serializePost($fresh),
            ],
        ], 201);
    }

    public function togglePray(MemberPost $memberPost): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('sanctum')->user();
        abort_unless($user, 401);

        $added = $this->interactionService->toggleReaction($memberPost, $user, 'pray');

        $fresh = $this->reloadPost($memberPost->id, $user->id);

        return response()->json([
            'data' => [
                'status' => $added ? 'added' : 'removed',
                'post' => $this->serializePost($fresh),
            ],
        ]);
    }

    public function toggleBookmark(MemberPost $memberPost): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('sanctum')->user();
        abort_unless($user, 401);

        $bookmark = MemberPostBookmark::query()
            ->where('member_post_id', $memberPost->id)
            ->where('user_id', $user->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $status = 'removed';
        } else {
            MemberPostBookmark::query()->create([
                'member_post_id' => $memberPost->id,
                'user_id' => $user->id,
            ]);
            $status = 'added';
        }

        $fresh = $this->reloadPost($memberPost->id, $user->id);

        return response()->json([
            'data' => [
                'status' => $status,
                'post' => $this->serializePost($fresh),
            ],
        ]);
    }

    public function commentsIndex(MemberPost $memberPost): JsonResponse
    {
        $comments = MemberPostComment::query()
            ->where('member_post_id', $memberPost->id)
            ->with('user:id,name,avatar_path')
            ->orderBy('created_at')
            ->limit(100)
            ->get()
            ->map(fn(MemberPostComment $comment) => $this->serializeComment($comment))
            ->values();

        return response()->json([
            'data' => [
                'comments' => $comments,
            ],
        ]);
    }

    public function commentsStore(Request $request, MemberPost $memberPost): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::guard('sanctum')->user();
        abort_unless($user, 401);

        $validated = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
        ]);

        $comment = MemberPostComment::query()->create([
            'member_post_id' => $memberPost->id,
            'user_id' => $user->id,
            'body' => trim((string) $validated['text']),
        ]);

        $comment->load('user:id,name,avatar_path');

        return response()->json([
            'data' => [
                'comment' => $this->serializeComment($comment),
            ],
        ], 201);
    }

    private function reloadPost(int $postId, int $userId): MemberPost
    {
        return MemberPost::query()
            ->with(['user:id,name,avatar_path'])
            ->withCount([
                'comments',
                'bookmarks',
                'reactions as pray_count' => fn($q) => $q->where('type', 'pray'),
            ])
            ->withExists([
                'reactions as is_prayed_by_me' => fn($q) => $q
                    ->where('type', 'pray')
                    ->where('user_id', $userId),
                'bookmarks as is_bookmarked_by_me' => fn($q) => $q
                    ->where('user_id', $userId),
            ])
            ->findOrFail($postId);
    }

    private function serializePost(MemberPost $post): array
    {
        return [
            'id' => (string) $post->id,
            'type' => (string) ($post->type->value ?? 'user_post'),
            'text' => (string) ($post->text ?? ''),
            'imageUrl' => $post->image_path,
            'mediaPaths' => $post->media_paths,
            'createdAt' => $post->created_at?->diffForHumans(),
            'author' => [
                'id' => (string) ($post->user?->id ?? ''),
                'name' => (string) ($post->user?->name ?? 'Member'),
                'avatarUrl' => $post->user?->getFilamentAvatarUrl(),
                'isOfficial' => (bool) ($post->user?->is_admin ?? false),
            ],
            'counts' => [
                'likes' => (int) ($post->pray_count ?? 0),
                'comments' => (int) ($post->comments_count ?? 0),
                'bookmarks' => (int) ($post->bookmarks_count ?? 0),
            ],
            'isLiked' => (bool) ($post->is_prayed_by_me ?? false),
            'isBookmarked' => (bool) ($post->is_bookmarked_by_me ?? false),
        ];
    }

    private function serializeComment(MemberPostComment $comment): array
    {
        return [
            'id' => (string) $comment->id,
            'postId' => (string) $comment->member_post_id,
            'text' => (string) $comment->body,
            'createdAt' => $comment->created_at?->diffForHumans(),
            'author' => [
                'id' => (string) ($comment->user?->id ?? ''),
                'name' => (string) ($comment->user?->name ?? 'Member'),
                'avatarUrl' => $comment->user?->getFilamentAvatarUrl(),
            ],
        ];
    }
}
