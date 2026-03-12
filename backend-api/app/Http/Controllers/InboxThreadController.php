<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InboxThreadController extends Controller
{
    public function show(Request $request, User $user, DirectMessageController $dmController): Response|JsonResponse
    {
        $auth = $request->user();
        abort_unless($auth, 401);
        abort_if((int) $auth->id === (int) $user->id, 404);

        $dmController->markIncomingAsRead((int) $auth->id, (int) $user->id);
        $chunk = $dmController->buildThreadChunk((int) $auth->id, (int) $user->id, null, 30);
        $partner = [
            'id' => (int) $user->id,
            'name' => (string) $user->name,
            'online' => $user->last_seen_at?->gte(now()->subMinutes(2)) ?? false,
            'last_seen_at' => optional($user->last_seen_at)?->toISOString(),
        ];

        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'partner' => $partner,
                'messages' => $chunk['messages'],
                'paging' => $chunk['paging'],
            ]);
        }

        return Inertia::render('Inbox/Show', [
            'partner' => $partner,
            'messages' => $chunk['messages'],
            'paging' => $chunk['paging'],
        ]);
    }
}
