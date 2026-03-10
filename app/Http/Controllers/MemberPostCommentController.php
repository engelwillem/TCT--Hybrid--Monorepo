<?php

namespace App\Http\Controllers;

use App\Models\MemberPost;
use App\Models\MemberPostComment;
use App\Notifications\MemberPostCommentReplyNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class MemberPostCommentController extends Controller
{
    public function index(MemberPost $memberPost): JsonResponse
    {
        $comments = MemberPostComment::query()
            ->where('member_post_id', $memberPost->id)
            ->with(['user:id,name', 'replyTo.user:id,name'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn (MemberPostComment $comment) => [
                'id' => $comment->id,
                'author' => $comment->user?->name ?? 'Unknown',
                'body' => $comment->body,
                'created_at' => optional($comment->created_at)?->diffForHumans(),
                'reply_to_id' => $comment->reply_to_comment_id,
                'reply_to_author' => $comment->replyTo?->user?->name,
            ])
            ->values();

        return response()->json([
            'comments' => $comments,
        ]);
    }

    public function store(Request $request, MemberPost $memberPost): JsonResponse
    {
        $user = Auth::user();
        abort_unless($user, 401);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'reply_to_comment_id' => ['nullable', 'integer'],
        ]);

        $replyToCommentId = isset($validated['reply_to_comment_id'])
            ? (int) $validated['reply_to_comment_id']
            : null;

        $replyTarget = null;
        if ($replyToCommentId) {
            $replyTarget = MemberPostComment::query()
                ->with('user:id,name')
                ->where('member_post_id', $memberPost->id)
                ->find($replyToCommentId);
        }

        $comment = MemberPostComment::query()->create([
            'member_post_id' => $memberPost->id,
            'user_id' => $user->id,
            'reply_to_comment_id' => $replyTarget?->id,
            'body' => trim((string) $validated['body']),
        ]);

        if ($replyTarget?->user && $replyTarget->user->id !== $user->id) {
            $replyTarget->user->notify(new MemberPostCommentReplyNotification(
                actorName: (string) $user->name,
                postId: $memberPost->id,
                snippet: trim((string) $validated['body']),
            ));
            Cache::forget("notifications:payload:user:{$replyTarget->user->id}");
        }

        return response()->json([
            'comment' => [
                'id' => $comment->id,
                'author' => (string) $user->name,
                'body' => $comment->body,
                'created_at' => optional($comment->created_at)?->diffForHumans(),
                'reply_to_id' => $replyTarget?->id,
                'reply_to_author' => $replyTarget?->user?->name,
            ],
        ]);
    }
}
