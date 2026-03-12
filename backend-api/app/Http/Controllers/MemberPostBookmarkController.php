<?php

namespace App\Http\Controllers;

use App\Models\MemberPost;
use App\Models\MemberPostBookmark;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class MemberPostBookmarkController extends Controller
{
    public function toggle(MemberPost $memberPost): RedirectResponse
    {
        $userId = Auth::id();
        abort_unless($userId, 401);

        $existing = MemberPostBookmark::query()
            ->where('member_post_id', $memberPost->id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            MemberPostBookmark::query()->create([
                'member_post_id' => $memberPost->id,
                'user_id' => $userId,
            ]);
        }

        return redirect()->back();
    }
}
