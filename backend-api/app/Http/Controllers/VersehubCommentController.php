<?php

namespace App\Http\Controllers;

use App\Models\VersehubComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VersehubCommentController extends Controller
{
    public function index(Request $request, string $lang, string $ref): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $comments = VersehubComment::query()
            ->with(['user:id,name,avatar_path,is_admin', 'replyTo.user:id,name'])
            ->where('verse_lang', $lang)
            ->where('verse_ref', Str::lower(trim($ref)))
            ->orderBy('created_at')
            ->limit(200)
            ->get()
            ->map(fn (VersehubComment $comment) => $this->serializeComment($comment))
            ->values()
            ->all();

        return response()->json([
            'data' => [
                'comments' => $comments,
                'count' => count($comments),
            ],
        ]);
    }

    public function store(Request $request, string $lang, string $ref): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:800'],
            'reply_to_id' => ['nullable', 'integer'],
        ]);

        $replyToCommentId = isset($validated['reply_to_id'])
            ? (int) $validated['reply_to_id']
            : null;

        $replyTarget = null;
        if ($replyToCommentId !== null) {
            $replyTarget = VersehubComment::query()
                ->where('id', $replyToCommentId)
                ->where('verse_lang', $lang)
                ->where('verse_ref', Str::lower(trim($ref)))
                ->first();
        }

        $comment = VersehubComment::query()->create([
            'verse_lang' => $lang,
            'verse_ref' => Str::lower(trim($ref)),
            'user_id' => $request->user()->id,
            'reply_to_id' => $replyTarget?->id,
            'body' => trim((string) $validated['body']),
        ]);

        $comment->load(['user:id,name,avatar_path,is_admin', 'replyTo.user:id,name']);

        return response()->json([
            'data' => [
                'comment' => $this->serializeComment($comment),
            ],
        ], 201);
    }

    private function serializeComment(VersehubComment $comment): array
    {
        return [
            'id' => (string) $comment->id,
            'verseRef' => (string) $comment->verse_ref,
            'text' => (string) $comment->body,
            'createdAt' => $comment->created_at?->diffForHumans(),
            'createdAtIso' => $comment->created_at?->toIso8601String(),
            'replyToId' => $comment->reply_to_id ? (string) $comment->reply_to_id : null,
            'replyToAuthor' => $comment->replyTo?->user?->name ? (string) $comment->replyTo->user->name : null,
            'author' => [
                'id' => (string) ($comment->user?->id ?? ''),
                'name' => (string) ($comment->user?->name ?? 'Member'),
                'avatarUrl' => $comment->user?->getFilamentAvatarUrl(),
                'isOfficial' => (bool) ($comment->user?->is_admin ?? false),
            ],
        ];
    }
}
