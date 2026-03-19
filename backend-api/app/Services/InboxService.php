<?php

namespace App\Services;

use App\Models\DirectMessage;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Support\Carbon;

class InboxService
{
    public function build(User $user): array
    {
        $userId = (int) $user->id;

        $followingIds = UserFollow::query()
            ->where('follower_id', $userId)
            ->pluck('followed_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $followerIds = UserFollow::query()
            ->where('followed_id', $userId)
            ->pluck('follower_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $followingSet = array_fill_keys($followingIds, true);
        $followerSet = array_fill_keys($followerIds, true);

        $messages = DirectMessage::query()
            ->where(fn ($q) => $q
                ->where('sender_id', $userId)
                ->orWhere('recipient_id', $userId))
            ->latest('id')
            ->limit(300)
            ->get(['id', 'sender_id', 'recipient_id', 'body', 'approved_at', 'read_at', 'created_at']);

        $latestByPartner = [];
        $partnerIds = [];

        foreach ($messages as $msg) {
            $senderId = (int) $msg->sender_id;
            $recipientId = (int) $msg->recipient_id;
            $partnerId = $senderId === $userId ? $recipientId : $senderId;

            if ($partnerId <= 0 || isset($latestByPartner[$partnerId])) {
                continue;
            }

            $latestByPartner[$partnerId] = $msg;
            $partnerIds[] = $partnerId;
        }

        $now = Carbon::now();
        $partnerMeta = User::query()
            ->whereIn('id', $partnerIds)
            ->get(['id', 'name', 'last_seen_at'])
            ->mapWithKeys(function (User $u) use ($now): array {
                $lastSeen = $u->last_seen_at;

                return [
                    (int) $u->id => [
                        'name' => (string) $u->name,
                        'online' => $lastSeen !== null && $lastSeen->gte($now->copy()->subMinutes(2)),
                        'last_seen_at' => optional($lastSeen)?->toISOString(),
                    ],
                ];
            })
            ->all();

        $tabs = [
            'primary' => [],
            'general' => [],
            'requests' => [],
        ];

        foreach ($latestByPartner as $partnerId => $msg) {
            $isIncoming = (int) $msg->recipient_id === $userId;
            $isFollowingPartner = isset($followingSet[$partnerId]);
            $isFollowedByPartner = isset($followerSet[$partnerId]);
            $isRequest = $isIncoming && $msg->approved_at === null && ! $isFollowingPartner;

            $bucket = 'general';
            if ($isRequest) {
                $bucket = 'requests';
            } elseif ($isFollowingPartner && $isFollowedByPartner) {
                $bucket = 'primary';
            }

            $tabs[$bucket][] = [
                'message_id' => (int) $msg->id,
                'partner' => [
                    'id' => $partnerId,
                    'name' => (string) ($partnerMeta[$partnerId]['name'] ?? 'Unknown'),
                    'online' => (bool) ($partnerMeta[$partnerId]['online'] ?? false),
                    'last_seen_at' => $partnerMeta[$partnerId]['last_seen_at'] ?? null,
                ],
                'preview' => $this->clip((string) $msg->body),
                'is_incoming' => $isIncoming,
                'is_unread' => $isIncoming && $msg->read_at === null,
                'approved' => $msg->approved_at !== null,
                'is_following_partner' => $isFollowingPartner,
                'is_followed_by_partner' => $isFollowedByPartner,
                'can_approve' => $isRequest,
                'created_at' => optional($msg->created_at)?->toISOString(),
            ];
        }

        foreach ($tabs as $key => $items) {
            usort($items, function (array $a, array $b): int {
                $aTs = strtotime((string) ($a['created_at'] ?? '')) ?: 0;
                $bTs = strtotime((string) ($b['created_at'] ?? '')) ?: 0;

                return $bTs <=> $aTs;
            });
            $tabs[$key] = array_slice($items, 0, 12);
        }

        return [
            'tabs' => $tabs,
            'counts' => [
                'primary' => count($tabs['primary']),
                'general' => count($tabs['general']),
                'requests' => count($tabs['requests']),
            ],
            'unreadCount' => collect($tabs)->flatten(1)->filter(fn ($item) => (bool) ($item['is_unread'] ?? false))->count(),
        ];
    }

    private function clip(string $text): string
    {
        $plain = trim(preg_replace('/\s+/', ' ', $text) ?? '');
        if ($plain === '') {
            return '';
        }

        if (mb_strlen($plain) <= 120) {
            return $plain;
        }

        return mb_substr($plain, 0, 117).'...';
    }
}
