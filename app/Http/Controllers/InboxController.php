<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use App\Services\InboxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class InboxController extends Controller
{
    public function index(Request $request, InboxService $service): Response
    {
        $user = $request->user();
        abort_unless($user, 401);

        $payload = [
            'inbox' => $service->build($user),
        ];

        // Support both:
        // - JSON polling/fetch (`Accept: application/json`)
        // - Inertia navigation (`Link` / router.visit('/inbox'))
        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json($payload);
        }

        return Inertia::render('Inbox/Index', $payload);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        DirectMessage::query()
            ->where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

        return response()->json([
            'ok' => true,
        ]);
    }
}
