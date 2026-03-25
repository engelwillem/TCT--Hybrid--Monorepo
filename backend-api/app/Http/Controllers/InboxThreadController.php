<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InboxThreadController extends Controller
{
    public function show(Request $request, User $user, DirectMessageController $dmController): JsonResponse
    {
        $auth = $request->user();
        abort_unless($auth, 401);
        abort_if((int) $auth->id === (int) $user->id, 404);

        $authFollowsPartner = $auth->following()->where('users.id', $user->id)->exists();
        $partnerFollowsAuth = $user->following()->where('users.id', $auth->id)->exists();

        $dmController->markIncomingAsRead((int) $auth->id, (int) $user->id);
        $chunk = $dmController->buildThreadChunk((int) $auth->id, (int) $user->id, null, 30);
        $partner = [
            'id' => (int) $user->id,
            'name' => (string) $user->name,
            'online' => $user->last_seen_at?->gte(now()->subMinutes(2)) ?? false,
            'last_seen_at' => optional($user->last_seen_at)?->toISOString(),
            'relationship' => [
                'is_following_partner' => $authFollowsPartner,
                'is_followed_by_partner' => $partnerFollowsAuth,
                'is_mutual_follow' => $authFollowsPartner && $partnerFollowsAuth,
            ],
        ];

        return response()->json([
            'partner' => $partner,
            'messages' => $chunk['messages'],
            'paging' => $chunk['paging'],
        ]);
    }
}
