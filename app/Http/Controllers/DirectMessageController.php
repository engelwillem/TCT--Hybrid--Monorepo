<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DirectMessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $auth = $request->user();
        abort_unless($auth, 401);

        $validated = $request->validate([
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $recipientId = (int) $validated['recipient_id'];
        if ($recipientId === (int) $auth->id) {
            return response()->json([
                'ok' => false,
                'message' => 'Cannot message yourself.',
            ], 422);
        }

        $recipient = User::query()->findOrFail($recipientId);
        $recipientFollowsSender = $recipient
            ->following()
            ->where('users.id', $auth->id)
            ->exists();

        $message = DirectMessage::query()->create([
            'sender_id' => $auth->id,
            'recipient_id' => $recipientId,
            'body' => trim((string) $validated['body']),
            'approved_at' => $recipientFollowsSender ? Carbon::now() : null,
        ]);

        return response()->json([
            'ok' => true,
            'message' => [
                'id' => (int) $message->id,
                'approved' => $message->approved_at !== null,
                'created_at' => optional($message->created_at)?->toISOString(),
            ],
        ]);
    }

    public function approve(Request $request, DirectMessage $directMessage): JsonResponse
    {
        $auth = $request->user();
        abort_unless($auth, 401);

        abort_unless((int) $directMessage->recipient_id === (int) $auth->id, 403);

        if ($directMessage->approved_at === null) {
            $directMessage->approved_at = Carbon::now();
            $directMessage->save();
        }

        return response()->json([
            'ok' => true,
            'approved' => true,
        ]);
    }

    public function thread(Request $request, User $user): JsonResponse
    {
        $auth = $request->user();
        abort_unless($auth, 401);
        abort_if((int) $auth->id === (int) $user->id, 404);

        $this->markIncomingAsRead((int) $auth->id, (int) $user->id);
        $beforeId = $request->integer('before_id');
        $limit = min(50, max(10, $request->integer('limit', 30)));
        $chunk = $this->buildThreadChunk((int) $auth->id, (int) $user->id, $beforeId, $limit);

        return response()->json([
            'messages' => $chunk['messages'],
            'paging' => $chunk['paging'],
            'partner' => [
                'id' => (int) $user->id,
                'name' => (string) $user->name,
                'online' => $user->last_seen_at?->gte(now()->subMinutes(2)) ?? false,
                'last_seen_at' => optional($user->last_seen_at)?->toISOString(),
            ],
        ]);
    }

    public function buildThreadChunk(
        int $authUserId,
        int $partnerId,
        ?int $beforeId = null,
        int $limit = 30
    ): array
    {
        $base = DirectMessage::query()
            ->where(function ($q) use ($authUserId, $partnerId) {
                $q->where('sender_id', $authUserId)->where('recipient_id', $partnerId);
            })
            ->orWhere(function ($q) use ($authUserId, $partnerId) {
                $q->where('sender_id', $partnerId)->where('recipient_id', $authUserId);
            });

        if ($beforeId && $beforeId > 0) {
            $base->where('id', '<', $beforeId);
        }

        /** @var Collection<int, DirectMessage> $rowsDesc */
        $rowsDesc = (clone $base)
            ->orderByDesc('id')
            ->limit($limit)
            ->get(['id', 'sender_id', 'recipient_id', 'body', 'approved_at', 'read_at', 'created_at']);

        /** @var Collection<int, DirectMessage> $rows */
        $rows = $rowsDesc->sortBy('id')->values();

        $messages = $rows->map(fn (DirectMessage $msg) => [
            'id' => (int) $msg->id,
            'body' => (string) $msg->body,
            'is_mine' => (int) $msg->sender_id === $authUserId,
            'approved' => $msg->approved_at !== null,
            'read_at' => optional($msg->read_at)?->toISOString(),
            'created_at' => optional($msg->created_at)?->toISOString(),
        ])->all();

        $oldestId = $rows->first()?->id;
        $hasMore = false;
        if ($oldestId) {
            $hasMore = (clone $base)->where('id', '<', $oldestId)->exists();
        }

        return [
            'messages' => $messages,
            'paging' => [
                'has_more' => $hasMore,
                'next_before_id' => $oldestId ? (int) $oldestId : null,
            ],
        ];
    }

    public function markIncomingAsRead(int $authUserId, int $partnerId): void
    {
        DirectMessage::query()
            ->where('sender_id', $partnerId)
            ->where('recipient_id', $authUserId)
            ->whereNull('read_at')
            ->update([
                'read_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
    }
}
