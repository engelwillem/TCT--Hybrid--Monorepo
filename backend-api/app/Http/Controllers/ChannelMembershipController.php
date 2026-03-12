<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChannelMembershipController extends Controller
{
    public function toggle(Request $request, Channel $channel): RedirectResponse
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
        }

        return redirect()->back()->with('status', $alreadyJoined ? 'left-channel' : 'joined-channel');
    }
}
