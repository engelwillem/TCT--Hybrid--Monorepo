<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TodaySessionArtifactController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $auth = $this->authorizeInternal($request);
        if ($auth !== null) {
            return $auth;
        }

        $key = $this->normalizeKey($request->query('key'));
        if ($key === null) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid cache key.',
            ], 422);
        }

        $artifact = Cache::get($this->artifactCacheKey($key));
        if (! is_array($artifact)) {
            return response()->json([
                'ok' => false,
                'message' => 'Artifact not found.',
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'artifact' => $artifact,
        ]);
    }

    public function latest(Request $request): JsonResponse
    {
        $auth = $this->authorizeInternal($request);
        if ($auth !== null) {
            return $auth;
        }

        $lang = $this->normalizeLang($request->query('lang'));
        if ($lang === null) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid language.',
            ], 422);
        }

        $artifact = Cache::get($this->latestCacheKey($lang));
        if (! is_array($artifact)) {
            return response()->json([
                'ok' => false,
                'message' => 'Artifact not found.',
            ], 404);
        }

        $maxAgeDays = $this->resolveMaxAgeDays($request);
        $maxAgeMs = $maxAgeDays * 24 * 60 * 60 * 1000;
        $fetchedAtMs = (int) ($artifact['fetchedAtMs'] ?? 0);
        if ($fetchedAtMs <= 0 || (int) floor(microtime(true) * 1000) - $fetchedAtMs > $maxAgeMs) {
            return response()->json([
                'ok' => false,
                'message' => 'Artifact too old.',
            ], 404);
        }

        $excludeDate = trim((string) $request->query('excludeDate', ''));
        if ($excludeDate !== '' && (string) ($artifact['date'] ?? '') === $excludeDate) {
            return response()->json([
                'ok' => false,
                'message' => 'No older artifact available.',
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'artifact' => $artifact,
        ]);
    }

    public function upsert(Request $request): JsonResponse
    {
        $auth = $this->authorizeInternal($request);
        if ($auth !== null) {
            return $auth;
        }

        $payload = $request->validate([
            'key' => ['required', 'string', 'max:120'],
            'artifact' => ['required', 'array'],
            'ttlSeconds' => ['nullable', 'integer', 'min:1', 'max:86400'],
        ]);

        $key = $this->normalizeKey($payload['key'] ?? null);
        $artifact = $payload['artifact'] ?? null;
        if ($key === null || ! is_array($artifact)) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid artifact payload.',
            ], 422);
        }

        $ttlSeconds = (int) ($payload['ttlSeconds'] ?? config('today.session_artifact_ttl_seconds', 900));
        $ttlSeconds = max(1, min(86400, $ttlSeconds));

        Cache::put($this->artifactCacheKey($key), $artifact, now()->addSeconds($ttlSeconds));

        $lang = $this->normalizeLang($artifact['lang'] ?? null);
        if ($lang !== null) {
            $latestKey = $this->latestCacheKey($lang);
            $currentLatest = Cache::get($latestKey);
            $newFetchedAtMs = (int) ($artifact['fetchedAtMs'] ?? 0);
            $currentFetchedAtMs = is_array($currentLatest) ? (int) ($currentLatest['fetchedAtMs'] ?? 0) : 0;
            if ($newFetchedAtMs > 0 && $newFetchedAtMs >= $currentFetchedAtMs) {
                Cache::put(
                    $latestKey,
                    $artifact,
                    now()->addDays($this->resolveConfiguredMaxAgeDays())
                );
            }
        }

        return response()->json([
            'ok' => true,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $auth = $this->authorizeInternal($request);
        if ($auth !== null) {
            return $auth;
        }

        $key = $this->normalizeKey($request->query('key'));
        if ($key === null) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid cache key.',
            ], 422);
        }

        Cache::forget($this->artifactCacheKey($key));

        return response()->json([
            'ok' => true,
        ]);
    }

    private function authorizeInternal(Request $request): ?JsonResponse
    {
        $configuredToken = trim((string) config('today.session_artifact_token', ''));
        if ($configuredToken === '') {
            if (app()->isLocal() || app()->environment('testing')) {
                return null;
            }

            return response()->json([
                'ok' => false,
                'message' => 'Artifact API token is not configured.',
            ], 503);
        }

        $providedToken = trim((string) $request->header('x-today-artifact-token', ''));
        if ($providedToken === '' || ! hash_equals($configuredToken, $providedToken)) {
            return response()->json([
                'ok' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        return null;
    }

    private function normalizeKey(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '' || strlen($trimmed) > 120) {
            return null;
        }

        return preg_match('/^[a-z0-9:_-]+$/i', $trimmed) === 1 ? $trimmed : null;
    }

    private function normalizeLang(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '' || strlen($trimmed) > 16) {
            return null;
        }

        return preg_match('/^[a-z0-9_-]+$/i', $trimmed) === 1 ? strtolower($trimmed) : null;
    }

    private function resolveMaxAgeDays(Request $request): int
    {
        $raw = (int) $request->query('maxAgeDays', $this->resolveConfiguredMaxAgeDays());
        return max(1, min(31, $raw));
    }

    private function resolveConfiguredMaxAgeDays(): int
    {
        $value = (int) config('today.session_artifact_max_age_days', 3);
        return max(1, min(31, $value));
    }

    private function artifactCacheKey(string $key): string
    {
        $prefix = trim((string) config('today.session_artifact_cache_prefix', 'today:session:artifact:'));
        return $prefix.$key;
    }

    private function latestCacheKey(string $lang): string
    {
        $prefix = trim((string) config('today.session_artifact_cache_prefix', 'today:session:artifact:'));
        return $prefix.'latest:'.$lang;
    }
}
