<?php

namespace App\Http\Controllers;

use App\Models\LandingClickEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FunnelAnalyticsController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_id' => ['required', 'string', 'max:64'],
            'event_name' => ['required', 'string', 'max:64'],
            'path' => ['nullable', 'string', 'max:255'],
            'surface' => ['nullable', 'string', 'max:32'],
            'meta' => ['nullable', 'array'],
            'occurred_at' => ['nullable', 'date'],
        ]);

        $meta = array_filter([
            'surface' => (string) ($data['surface'] ?? 'web'),
            'occurred_at' => $data['occurred_at'] ?? null,
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'ip_hash_hint' => sha1((string) $request->ip()),
            'payload_meta' => $data['meta'] ?? null,
        ], static fn ($value) => $value !== null && $value !== '');

        LandingClickEvent::create([
            'user_id' => optional($request->user())->id,
            'session_id' => (string) $data['session_id'],
            'variant' => 'p0',
            'event_name' => (string) $data['event_name'],
            'target' => isset($data['meta']['target']) && is_scalar($data['meta']['target'])
                ? substr((string) $data['meta']['target'], 0, 255)
                : null,
            'page' => (string) ($data['path'] ?? '/'),
            'meta' => $meta,
        ]);

        return response()->json([
            'data' => [
                'ok' => true,
            ],
        ], 201);
    }
}
