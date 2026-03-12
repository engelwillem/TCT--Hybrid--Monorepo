<?php

namespace App\Http\Controllers;

use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SsDayAdminController extends Controller
{
    private function resolveLesson(int $year, int $quarter, int $lessonNumber): SsLesson
    {
        $q = SsQuarter::query()
            ->where('year', $year)
            ->where('quarter', $quarter)
            ->firstOrFail();

        return SsLesson::query()
            ->where('quarter_id', $q->id)
            ->where('lesson_number', $lessonNumber)
            ->firstOrFail();
    }

    private function normalizeMediaLinks(mixed $raw): array
    {
        if (!is_array($raw)) {
            return [];
        }

        $normalized = [];
        foreach ($raw as $entry) {
            if (is_string($entry)) {
                $url = trim($entry);
                if ($url !== '') {
                    $normalized[] = ['url' => $url];
                }
                continue;
            }

            if (!is_array($entry)) {
                continue;
            }

            $url = trim((string) ($entry['url'] ?? ''));
            if ($url === '') {
                continue;
            }

            $normalized[] = ['url' => $url];
        }

        return array_values($normalized);
    }

    public function store(Request $request, int $year, int $quarter, int $lessonNumber): JsonResponse
    {
        $lesson = $this->resolveLesson($year, $quarter, $lessonNumber);

        $validated = $request->validate([
            'day_key' => ['required', Rule::in(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'])],
            'date' => ['required', 'date'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'cover_image_url' => ['nullable', 'string', 'max:2048'],
            'media_links' => ['nullable', 'array'],
            'media_links.*.url' => ['nullable', 'string', 'max:2048'],
        ]);

        $existsByDayKey = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->where('day_key', $validated['day_key'])
            ->exists();
        abort_if($existsByDayKey, 422, 'Day key already exists in this lesson.');

        $existsByDate = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->whereDate('date', $validated['date'])
            ->exists();
        abort_if($existsByDate, 422, 'Date already exists in this lesson.');

        $day = SsDay::query()->create([
            'lesson_id' => $lesson->id,
            'day_key' => $validated['day_key'],
            'date' => $validated['date'],
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'] ?? null,
            'status' => $validated['status'],
            'cover_image_url' => $validated['cover_image_url'] ?? null,
            'media_links' => $this->normalizeMediaLinks($validated['media_links'] ?? []),
        ]);

        return response()->json([
            'ok' => true,
            'day_id' => $day->id,
            'redirect_url' => "/channels/sabbath-school/{$year}/q{$quarter}/lesson/{$lessonNumber}/{$day->day_key}",
        ]);
    }

    public function update(Request $request, int $year, int $quarter, int $lessonNumber, string $dayKey): JsonResponse
    {
        $lesson = $this->resolveLesson($year, $quarter, $lessonNumber);

        $day = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->where('day_key', $dayKey)
            ->firstOrFail();

        $validated = $request->validate([
            'day_key' => ['required', Rule::in(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'])],
            'date' => ['required', 'date'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'cover_image_url' => ['nullable', 'string', 'max:2048'],
            'media_links' => ['nullable', 'array'],
            'media_links.*.url' => ['nullable', 'string', 'max:2048'],
        ]);

        $existsByDayKey = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->where('day_key', $validated['day_key'])
            ->whereKeyNot($day->id)
            ->exists();
        abort_if($existsByDayKey, 422, 'Day key already exists in this lesson.');

        $existsByDate = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->whereDate('date', $validated['date'])
            ->whereKeyNot($day->id)
            ->exists();
        abort_if($existsByDate, 422, 'Date already exists in this lesson.');

        $day->fill([
            'day_key' => $validated['day_key'],
            'date' => $validated['date'],
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'] ?? null,
            'status' => $validated['status'],
            'cover_image_url' => $validated['cover_image_url'] ?? null,
            'media_links' => $this->normalizeMediaLinks($validated['media_links'] ?? []),
        ]);
        $day->save();

        return response()->json([
            'ok' => true,
            'day_id' => $day->id,
            'redirect_url' => "/channels/sabbath-school/{$year}/q{$quarter}/lesson/{$lessonNumber}/{$day->day_key}",
        ]);
    }

    public function destroy(int $year, int $quarter, int $lessonNumber, string $dayKey): JsonResponse
    {
        $lesson = $this->resolveLesson($year, $quarter, $lessonNumber);

        $day = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->where('day_key', $dayKey)
            ->firstOrFail();

        $day->delete();

        $fallback = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->orderBy('date')
            ->first();

        return response()->json([
            'ok' => true,
            'redirect_url' => $fallback
                ? "/channels/sabbath-school/{$year}/q{$quarter}/lesson/{$lessonNumber}/{$fallback->day_key}"
                : "/channels/sabbath-school/{$year}/q{$quarter}/lesson/{$lessonNumber}",
        ]);
    }
}
