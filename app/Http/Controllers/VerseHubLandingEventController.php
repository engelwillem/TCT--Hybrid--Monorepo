<?php

namespace App\Http\Controllers;

use App\Models\VerseHubLandingEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VerseHubLandingEventController extends Controller
{
    private const ALLOWED_EVENTS = [
        'landing_view',
        'cta_start_here_click',
        'cta_continue_click',
        'cta_explore_open',
        'cta_path_click',
        'search_submit',
    ];

    public function store(Request $request, string $lang): JsonResponse
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $validated = $request->validate([
            'session_id' => ['required', 'string', 'min:12', 'max:64'],
            'persona' => ['required', 'in:new_believer,returning_reader'],
            'variant' => ['required', 'in:a,b'],
            'event_name' => ['required', 'string', 'max:64'],
            'meta' => ['nullable', 'array'],
            'occurred_at' => ['nullable', 'date'],
        ]);

        $eventName = Str::lower(trim((string) $validated['event_name']));
        abort_unless(in_array($eventName, self::ALLOWED_EVENTS, true), 422);

        VerseHubLandingEvent::query()->create([
            'user_id' => $request->user()?->id,
            'lang' => $lang,
            'session_id' => trim((string) $validated['session_id']),
            'persona' => (string) $validated['persona'],
            'variant' => (string) $validated['variant'],
            'event_name' => $eventName,
            'meta' => $validated['meta'] ?? null,
            'occurred_at' => $validated['occurred_at'] ?? now(),
        ]);

        return response()->json(['ok' => true]);
    }
}

