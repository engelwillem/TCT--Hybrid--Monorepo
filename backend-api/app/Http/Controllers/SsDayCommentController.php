<?php

namespace App\Http\Controllers;

use App\Models\SsDay;
use App\Models\SsDayComment;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SsDayCommentController extends Controller
{
    private function resolveDay(int $year, int $quarter, int $lessonNumber, string $dayKey): SsDay
    {
        $q = SsQuarter::query()
            ->where('year', $year)
            ->where('quarter', $quarter)
            ->firstOrFail();

        $lesson = SsLesson::query()
            ->where('quarter_id', $q->id)
            ->where('lesson_number', $lessonNumber)
            ->firstOrFail();

        return SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->where('day_key', $dayKey)
            ->firstOrFail();
    }

    public function index(int $year, int $quarter, int $lessonNumber, string $dayKey): JsonResponse
    {
        $user = request()->user();
        $day = $this->resolveDay($year, $quarter, $lessonNumber, $dayKey);

        $comments = SsDayComment::query()
            ->where('ss_day_id', $day->id)
            ->with(['user:id,name', 'replyTo.user:id,name'])
            ->orderByDesc('created_at')
            ->limit(150)
            ->get()
            ->map(fn (SsDayComment $c) => [
                'id' => $c->id,
                'author' => $c->user?->name ?? $c->author_name ?? 'Guest',
                'body' => $c->body,
                'created_at' => optional($c->created_at)?->diffForHumans(),
                'reply_to_id' => $c->reply_to_id,
                'reply_to_author' => $c->replyTo?->user?->name ?? $c->replyTo?->author_name,
                'can_delete' => (bool) ($user && ($user->is_admin || $user->id === $c->user_id)),
                'can_edit' => (bool) ($user && ($user->is_admin || $user->id === $c->user_id)),
            ])
            ->values();

        return response()->json(['comments' => $comments]);
    }

    public function store(Request $request, int $year, int $quarter, int $lessonNumber, string $dayKey): JsonResponse
    {
        $user = $request->user();

        $day = $this->resolveDay($year, $quarter, $lessonNumber, $dayKey);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'reply_to_id' => ['nullable', 'integer'],
            'author_name' => ['nullable', 'string', 'max:80'],
        ]);

        $replyTarget = null;
        $replyToId = isset($validated['reply_to_id']) ? (int) $validated['reply_to_id'] : null;
        if ($replyToId) {
            $replyTarget = SsDayComment::query()
                ->where('id', $replyToId)
                ->where('ss_day_id', $day->id)
                ->with('user:id,name')
                ->first();
        }

        $authorName = $user?->name ?: trim((string) ($validated['author_name'] ?? ''));
        if ($authorName === '') {
            $authorName = 'Guest';
        }

        $comment = SsDayComment::query()->create([
            'ss_day_id' => $day->id,
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
                'can_delete' => (bool) $user,
                'can_edit' => (bool) $user,
            ],
        ]);
    }

    public function update(
        Request $request,
        int $year,
        int $quarter,
        int $lessonNumber,
        string $dayKey,
        int $commentId
    ): JsonResponse {
        $user = $request->user();
        abort_unless($user, 401);

        $day = $this->resolveDay($year, $quarter, $lessonNumber, $dayKey);

        $comment = SsDayComment::query()
            ->where('id', $commentId)
            ->where('ss_day_id', $day->id)
            ->firstOrFail();

        abort_unless($user->is_admin || $user->id === $comment->user_id, 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $comment->body = trim((string) $validated['body']);
        $comment->save();

        return response()->json([
            'ok' => true,
            'comment' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'created_at' => optional($comment->created_at)?->diffForHumans(),
                'can_delete' => true,
                'can_edit' => true,
            ],
        ]);
    }

    public function destroy(Request $request, int $year, int $quarter, int $lessonNumber, string $dayKey, int $commentId): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $day = $this->resolveDay($year, $quarter, $lessonNumber, $dayKey);

        $comment = SsDayComment::query()
            ->where('id', $commentId)
            ->where('ss_day_id', $day->id)
            ->firstOrFail();

        abort_unless($user->is_admin || $user->id === $comment->user_id, 403);

        $comment->delete();

        return response()->json(['ok' => true]);
    }
}
