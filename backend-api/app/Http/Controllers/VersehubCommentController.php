<?php

namespace App\Http\Controllers;

use App\Models\VersehubComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VersehubCommentController extends Controller
{
    public function index(string $lang, string $ref): JsonResponse
    {
        $comments = VersehubComment::query()
            ->where('verse_lang', $lang)
            ->where('verse_ref', strtolower(trim($ref)))
            ->with(['user:id,name', 'replyTo.user:id,name'])
            ->orderByDesc('created_at')
            ->limit(150)
            ->get()
            ->map(fn (VersehubComment $c) => [
                'id' => $c->id,
                'author' => $c->user?->name ?? $c->author_name ?? 'Guest',
                'body' => $c->body,
                'created_at' => optional($c->created_at)?->diffForHumans(),
                'reply_to_id' => $c->reply_to_id,
                'reply_to_author' => $c->replyTo?->user?->name ?? $c->replyTo?->author_name,
            ])
            ->values();

        return response()->json(['comments' => $comments]);
    }

    public function store(Request $request, string $lang, string $ref): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'reply_to_id' => ['nullable', 'integer'],
            'author_name' => ['nullable', 'string', 'max:80'],
        ]);

        $replyToId = isset($validated['reply_to_id']) ? (int) $validated['reply_to_id'] : null;
        $replyTarget = null;
        if ($replyToId) {
            $replyTarget = VersehubComment::query()
                ->where('id', $replyToId)
                ->where('verse_lang', $lang)
                ->where('verse_ref', strtolower(trim($ref)))
                ->first();
        }

        $authorName = $user?->name ?: trim((string) ($validated['author_name'] ?? ''));
        if ($authorName === '') {
            $authorName = 'Guest';
        }

        $comment = VersehubComment::query()->create([
            'verse_lang' => $lang,
            'verse_ref' => strtolower(trim($ref)),
            'user_id' => $user?->id,
            'author_name' => $authorName,
            'reply_to_id' => $replyTarget?->id,
            'body' => trim((string) $validated['body']),
        ]);

        return response()->json([
            'comment' => [
                'id' => $comment->id,
                'author' => $authorName,
                'body' => $comment->body,
                'created_at' => optional($comment->created_at)?->diffForHumans(),
                'reply_to_id' => $replyTarget?->id,
                'reply_to_author' => $replyTarget?->user?->name ?? $replyTarget?->author_name,
            ],
        ]);
    }
}
