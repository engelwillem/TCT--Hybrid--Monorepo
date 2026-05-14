<?php

namespace App\Http\Controllers;

use App\Models\VerseHubLandingEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerseHubEventController extends Controller
{
    public function store(Request $request, string $lang): JsonResponse
    {
        $data = $request->validate([
            'session_id' => ['required', 'string', 'max:64'],
            'persona' => ['nullable', 'string', 'max:32'],
            'variant' => ['nullable', 'string', 'max:4'],
            'event_name' => ['required', 'string', 'max:64'],
            'meta' => ['nullable', 'array'],
        ]);

        VerseHubLandingEvent::create([
            'user_id' => optional($request->user())->id,
            'lang' => $lang,
            'session_id' => (string) $data['session_id'],
            'persona' => (string) ($data['persona'] ?? 'reader'),
            'variant' => (string) ($data['variant'] ?? 'p5'),
            'event_name' => (string) $data['event_name'],
            'meta' => $data['meta'] ?? null,
            'occurred_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'ok' => true,
            ],
        ], 201);
    }
}
