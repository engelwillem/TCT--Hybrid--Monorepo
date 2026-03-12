<?php

namespace App\Http\Controllers;

use App\Models\MemberPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberPostAdminController extends Controller
{
    public function action(Request $request, MemberPost $memberPost): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && $user->is_admin, 403);

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:hide,extend_24h,expire_now'],
        ]);

        $action = (string) $validated['action'];
        if ($action === 'hide') {
            $memberPost->hidden_at = now();
            $memberPost->save();
        }

        if ($action === 'extend_24h') {
            $base = $memberPost->expires_at && $memberPost->expires_at->isFuture()
                ? $memberPost->expires_at
                : now();
            $memberPost->expires_at = $base->copy()->addDay();
            $memberPost->save();
        }

        if ($action === 'expire_now') {
            $memberPost->expires_at = now();
            $memberPost->save();
        }

        return response()->json([
            'ok' => true,
            'post_id' => $memberPost->id,
            'action' => $action,
            'expires_at' => optional($memberPost->expires_at)->toISOString(),
            'hidden_at' => optional($memberPost->hidden_at)->toISOString(),
        ]);
    }
}
