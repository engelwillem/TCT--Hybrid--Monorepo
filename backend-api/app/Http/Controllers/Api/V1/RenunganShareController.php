<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RenunganShareSnapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class RenunganShareController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lang' => ['nullable', 'string', 'in:id,en'],
            'verse_reference' => ['required', 'string', 'min:2', 'max:120'],
            'verse_text' => ['required', 'string', 'min:8', 'max:1200'],
            'meditation_excerpt' => ['required', 'string', 'min:24', 'max:900'],
            'theme' => ['nullable', 'string', 'max:80'],
            'ttl_hours' => ['nullable', 'integer', 'min:1', 'max:168'],
        ]);

        $user = $request->user();
        $ttlHours = (int) ($validated['ttl_hours'] ?? 72);
        $expiresAt = Carbon::now()->addHours($ttlHours);

        $snapshot = RenunganShareSnapshot::query()->create([
            'user_id' => (int) $user->id,
            'token' => Str::random(64),
            'lang' => (string) ($validated['lang'] ?? 'id'),
            'verse_reference' => trim((string) $validated['verse_reference']),
            'verse_text' => trim((string) $validated['verse_text']),
            'meditation_excerpt' => trim((string) $validated['meditation_excerpt']),
            'theme' => isset($validated['theme']) ? trim((string) $validated['theme']) : null,
            'expires_at' => $expiresAt,
        ]);

        return response()->json([
            'data' => [
                'token' => $snapshot->token,
                'share_path' => '/renungan/share/'.$snapshot->token,
                'expires_at' => $snapshot->expires_at?->toIso8601String(),
                'ttl_hours' => $ttlHours,
            ],
        ]);
    }

    public function show(string $token): JsonResponse
    {
        $snapshot = RenunganShareSnapshot::query()
            ->where('token', $token)
            ->first();

        if (! $snapshot || ! $snapshot->isActive()) {
            return response()->json([
                'message' => 'Share snapshot not found or expired.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'token' => $snapshot->token,
                'lang' => $snapshot->lang,
                'verse_reference' => $snapshot->verse_reference,
                'verse_text' => $snapshot->verse_text,
                'meditation_excerpt' => $snapshot->meditation_excerpt,
                'theme' => $snapshot->theme,
                'expires_at' => $snapshot->expires_at?->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, string $token): JsonResponse
    {
        $snapshot = RenunganShareSnapshot::query()
            ->where('token', $token)
            ->where('user_id', (int) $request->user()->id)
            ->first();

        if (! $snapshot) {
            return response()->json([
                'message' => 'Snapshot not found.',
            ], 404);
        }

        if ($snapshot->revoked_at !== null) {
            return response()->json([
                'data' => [
                    'revoked' => true,
                    'already_revoked' => true,
                ],
            ]);
        }

        $snapshot->forceFill([
            'revoked_at' => Carbon::now(),
            'revoked_by' => (int) $request->user()->id,
        ])->save();

        return response()->json([
            'data' => [
                'revoked' => true,
                'already_revoked' => false,
            ],
        ]);
    }
}

