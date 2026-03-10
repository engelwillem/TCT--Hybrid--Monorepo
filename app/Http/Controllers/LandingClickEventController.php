<?php

namespace App\Http\Controllers;

use App\Models\LandingClickEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LandingClickEventController extends Controller
{
    private const ALLOWED_EVENTS = [
        'header_login_click',
        'hero_primary_click',
        'hero_secondary_click',
        'hero_login_click',
        'final_primary_click',
        'final_login_click',
    ];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string', 'min:8', 'max:64'],
            'variant' => ['required', 'in:a,b'],
            'event_name' => ['required', 'string', 'max:64'],
            'target' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'string', 'max:120'],
            'meta' => ['nullable', 'array'],
        ]);

        $eventName = Str::lower(trim((string) $validated['event_name']));
        abort_unless(in_array($eventName, self::ALLOWED_EVENTS, true), 422);

        LandingClickEvent::query()->create([
            'user_id' => $request->user()?->id,
            'session_id' => (string) $validated['session_id'],
            'variant' => (string) $validated['variant'],
            'event_name' => $eventName,
            'target' => $validated['target'] ?? null,
            'page' => (string) ($validated['page'] ?? '/'),
            'meta' => $validated['meta'] ?? null,
        ]);

        return response()->json(['ok' => true]);
    }
}
