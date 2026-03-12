<?php

namespace App\Http\Controllers;

use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SabbathSchoolController extends Controller
{
    public function index(): Response
    {
        $quarters = SsQuarter::query()
            ->orderByDesc('year')
            ->orderBy('quarter')
            ->get(['id', 'year', 'quarter', 'title', 'start_date', 'end_date', 'is_active']);

        $activeQuarter = $quarters->firstWhere('is_active', true) ?? $quarters->first();

        // Provide lessons per quarter (for a compact lesson picker UI).
        // IMPORTANT: avoid N+1 queries by loading all lessons once.
        $lessonsByQuarterId = SsLesson::query()
            ->whereIn('quarter_id', $quarters->pluck('id'))
            ->orderBy('lesson_number')
            ->get(['id', 'quarter_id', 'lesson_number', 'title', 'start_date', 'end_date'])
            ->groupBy('quarter_id');

        $quartersWithLessons = $quarters
            ->map(function (SsQuarter $q) use ($lessonsByQuarterId) {
                return [
                    'id' => $q->id,
                    'year' => $q->year,
                    'quarter' => $q->quarter,
                    'title' => $q->title,
                    'start_date' => $q->start_date,
                    'end_date' => $q->end_date,
                    'is_active' => (bool) $q->is_active,
                    'lessons' => ($lessonsByQuarterId->get($q->id) ?? collect())->values(),
                ];
            })
            ->values();

        // Compute today's target (prefer published content) so the UI can offer
        // a 1-tap "Continue reading" entry.
        $today = Carbon::today();
        $todayDay = SsDay::query()
            ->whereDate('date', $today)
            ->where('status', 'published')
            ->with('lesson.quarter')
            ->first();

        // Fallback: if today's day is not published, use latest published day.
        if (!$todayDay) {
            $todayDay = SsDay::query()
                ->where('status', 'published')
                ->orderByDesc('date')
                ->with('lesson.quarter')
                ->first();
        }

        $todayTarget = null;
        if ($todayDay) {
            $lesson = $todayDay->lesson;
            $q = $lesson?->quarter;

            if ($lesson && $q) {
                $todayTarget = [
                    'year' => $q->year,
                    'quarter' => $q->quarter,
                    'lesson_number' => $lesson->lesson_number,
                    'day_key' => $todayDay->day_key,
                    'date' => $todayDay->date,
                ];
            }
        }

        return Inertia::render('Channels/SabbathSchool/QuarterIndex', [
            'quarters' => $quarters,
            'activeQuarterId' => $activeQuarter?->id,
            'activeQuarter' => $activeQuarter,
            'quartersWithLessons' => $quartersWithLessons,
            'todayTarget' => $todayTarget,
        ]);
    }

    public function lesson(int $year, int $quarter, int $lessonNumber): Response
    {
        $q = SsQuarter::query()
            ->where('year', $year)
            ->where('quarter', $quarter)
            ->firstOrFail();

        $lesson = SsLesson::query()
            ->where('quarter_id', $q->id)
            ->where('lesson_number', $lessonNumber)
            ->firstOrFail();

        // Reader default: prefer today's published day in this lesson,
        // otherwise fall back to Saturday, otherwise the first available day.
        $today = Carbon::today();

        $defaultDay = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->whereDate('date', $today)
            ->where('status', 'published')
            ->select(['id', 'lesson_id', 'day_key', 'date', 'title', 'content', 'media_links', 'cover_image_url', 'status'])
            ->first();

        if (! $defaultDay) {
            $defaultDay = SsDay::query()
                ->where('lesson_id', $lesson->id)
                ->where('day_key', 'sat')
                ->select(['id', 'lesson_id', 'day_key', 'date', 'title', 'content', 'media_links', 'cover_image_url', 'status'])
                ->first();
        }

        if (! $defaultDay) {
            $defaultDay = SsDay::query()
                ->where('lesson_id', $lesson->id)
                ->orderBy('date')
                ->select(['id', 'lesson_id', 'day_key', 'date', 'title', 'content', 'media_links', 'cover_image_url', 'status'])
                ->first();
        }

        abort_unless($defaultDay, 404);

        // Keep payload light: list days without `content`.
        // The reader page loads content only for the active `day`.
        $days = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->orderBy('date')
            ->get(['day_key', 'date', 'title', 'cover_image_url', 'status']);

        return Inertia::render('Channels/SabbathSchool/DayShow', [
            'quarter' => $q,
            'lesson' => $lesson,
            'day' => $defaultDay,
            'days' => $days,
        ]);
    }

    public function day(int $year, int $quarter, int $lessonNumber, string $dayKey): Response
    {
        $q = SsQuarter::query()
            ->where('year', $year)
            ->where('quarter', $quarter)
            ->firstOrFail();

        $lesson = SsLesson::query()
            ->where('quarter_id', $q->id)
            ->where('lesson_number', $lessonNumber)
            ->firstOrFail();

        $day = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->where('day_key', $dayKey)
            ->select(['id', 'lesson_id', 'day_key', 'date', 'title', 'content', 'media_links', 'cover_image_url', 'status'])
            ->firstOrFail();

        // Keep payload light: list days without `content`.
        $days = SsDay::query()
            ->where('lesson_id', $lesson->id)
            ->orderBy('date')
            ->get(['day_key', 'date', 'title', 'cover_image_url', 'status']);

        return Inertia::render('Channels/SabbathSchool/DayShow', [
            'quarter' => $q,
            'lesson' => $lesson,
            'day' => $day,
            'days' => $days,
        ]);
    }
}
