<?php

namespace App\Services\Community;

use App\Events\Community\PostRepostedToTalks;
use App\Models\MemberPost;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CommunityRepostService
{
    /**
     * @return array{post: MemberPost, result: string, previous_status: string}
     */
    public function repostToTalks(
        MemberPost $memberPost,
        int $actorId,
        ?string $requestId = null,
        string $sourceSurface = 'gallery'
    ): array
    {
        $repostedAt = Carbon::now();

        $result = 'already_active';
        $previousStatus = (string) ($memberPost->status ?: 'active');

        /** @var MemberPost $locked */
        $locked = DB::transaction(function () use ($memberPost, $actorId, $repostedAt, &$result, &$previousStatus): MemberPost {
            $lockedPost = MemberPost::query()
                ->whereKey($memberPost->id)
                ->lockForUpdate()
                ->firstOrFail();

            $previousStatus = (string) ($lockedPost->status ?: 'active');
            $isAlreadyActive = $previousStatus === 'active' && $lockedPost->expires_at?->isFuture();

            if (! $isAlreadyActive) {
                $result = 'transitioned';
                $lockedPost->forceFill([
                    'status' => 'active',
                    'activated_at' => $repostedAt,
                    'expires_at' => $repostedAt->copy()->addDay(),
                    'repost_count' => (int) ($lockedPost->repost_count ?? 0) + 1,
                    'last_reposted_by' => $actorId,
                ]);
            } else {
                $lockedPost->forceFill([
                    'status' => 'active',
                    'activated_at' => $lockedPost->activated_at ?: $repostedAt,
                    'expires_at' => $lockedPost->expires_at ?: $repostedAt->copy()->addDay(),
                ]);
            }

            $metadata = is_array($lockedPost->metadata) ? $lockedPost->metadata : [];
            $metadata['last_activated_at'] = ($lockedPost->activated_at ?: $repostedAt)->toIso8601String();
            $metadata['last_reposted_at'] = $repostedAt->toIso8601String();
            $lockedPost->metadata = $metadata;
            $lockedPost->save();

            return $lockedPost;
        });

        if ($result === 'transitioned') {
            PostRepostedToTalks::dispatch(
                (int) $locked->id,
                (int) $locked->user_id,
                $actorId,
                $previousStatus,
                (string) ($locked->status ?: 'active'),
                (int) ($locked->repost_count ?? 0),
                ($locked->activated_at ?: $repostedAt)->toIso8601String(),
                $sourceSurface,
                $requestId,
            );
        }

        return [
            'post' => $locked,
            'result' => $result,
            'previous_status' => $previousStatus,
        ];
    }
}
