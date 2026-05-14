<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\DirectMessage;
use App\Services\Engagement\SystemAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChannelMembershipController extends Controller
{
    public function __construct(
        private readonly SystemAccountService $systemAccountService,
    ) {
    }

    public function toggle(Request $request, Channel $channel): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $alreadyJoined = $channel->members()
            ->where('users.id', $user->id)
            ->exists();

        if ($alreadyJoined) {
            $channel->members()->detach($user->id);
        } else {
            $channel->members()->syncWithoutDetaching([
                $user->id => [
                    'role' => 'member',
                    'joined_at' => now(),
                ],
            ]);
            $this->notifyMemberJoinedChannel($user->id, (string) $channel->title);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'ok' => true,
                'status' => $alreadyJoined ? 'left-channel' : 'joined-channel',
                'is_joined' => ! $alreadyJoined,
                'members_count' => $channel->members()->count(),
            ]);
        }

        return redirect()->back()->with('status', $alreadyJoined ? 'left-channel' : 'joined-channel');
    }

    private function notifyMemberJoinedChannel(int $recipientUserId, string $channelName): void
    {
        $sender = $this->systemAccountService->getEncourager();
        $channelLabel = trim($channelName) !== '' ? trim($channelName) : 'this channel';

        DirectMessage::query()->create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipientUserId,
            'body' => "Welcome! You have successfully joined {$channelLabel}. We are glad to have you here.",
            'approved_at' => now(),
            'read_at' => null,
        ]);
    }
}
