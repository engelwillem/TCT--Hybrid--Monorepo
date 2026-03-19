<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class ChannelController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $allowedSlugs = ['sabbath-school', 'god-first', 'faith-journey', 'family', 'public-post'];
        $channels = Channel::query()
            ->whereIn('slug', $allowedSlugs)
            ->withCount('members')
            ->withExists([
                'members as is_joined' => fn($q) => $q->where('users.id', $user?->id ?? 0),
            ])
            ->orderByRaw("CASE slug
                WHEN 'sabbath-school' THEN 1
                WHEN 'god-first' THEN 2
                WHEN 'faith-journey' THEN 3
                WHEN 'family' THEN 4
                ELSE 99
            END")
            ->get(['id', 'slug', 'title', 'description', 'cover_image_url', 'type']);

        $sabbathChannel = $channels->firstWhere('slug', 'sabbath-school');
        $nonSabbathChannels = $channels
            ->filter(fn(Channel $channel) => $channel->slug !== 'sabbath-school')
            ->values();

        $quarters = SsQuarter::query()
            ->orderByDesc('year')
            ->orderBy('quarter')
            ->get(['id', 'year', 'quarter', 'title', 'start_date', 'end_date', 'is_active']);

        $today = Carbon::today();
        $activeQuarter = $quarters->first(function (SsQuarter $quarter) use ($today): bool {
            if (!$quarter->start_date || !$quarter->end_date) {
                return false;
            }

            return Carbon::parse($quarter->start_date)->startOfDay()->lte($today)
                && Carbon::parse($quarter->end_date)->endOfDay()->gte($today);
        }) ?? $quarters->firstWhere('is_active', true) ?? $quarters->first();

        $lessonsByQuarterId = SsLesson::query()
            ->whereIn('quarter_id', $quarters->pluck('id'))
            ->orderBy('lesson_number')
            ->get(['id', 'quarter_id', 'lesson_number', 'title', 'start_date', 'end_date'])
            ->groupBy('quarter_id');

        $quartersWithLessons = $quarters
            ->map(function (SsQuarter $quarter) use ($lessonsByQuarterId): array {
                return [
                    'id' => $quarter->id,
                    'year' => $quarter->year,
                    'quarter' => $quarter->quarter,
                    'title' => $quarter->title,
                    'start_date' => $quarter->start_date,
                    'end_date' => $quarter->end_date,
                    'is_active' => (bool) $quarter->is_active,
                    'lessons' => ($lessonsByQuarterId->get($quarter->id) ?? collect())->values(),
                ];
            })
            ->values();

        $activeLessons = collect();
        if ($activeQuarter) {
            $activeLessons = ($lessonsByQuarterId->get($activeQuarter->id) ?? collect())->values();
        }

        $todayLesson = null;
        if ($activeQuarter) {
            $todayLesson = SsLesson::query()
                ->where('quarter_id', $activeQuarter->id)
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->orderBy('lesson_number')
                ->first();
        }

        $todayDay = SsDay::query()
            ->whereDate('date', $today)
            ->where('status', 'published')
            ->with('lesson.quarter')
            ->first();

        if (!$todayDay && $todayLesson) {
            $todayDay = SsDay::query()
                ->where('lesson_id', $todayLesson->id)
                ->where('status', 'published')
                ->whereDate('date', '<=', $today)
                ->orderByDesc('date')
                ->with('lesson.quarter')
                ->first();
        }

        if (!$todayDay && $todayLesson) {
            $todayDay = SsDay::query()
                ->where('lesson_id', $todayLesson->id)
                ->where('status', 'published')
                ->orderBy('date')
                ->with('lesson.quarter')
                ->first();
        }

        if (!$todayDay) {
            $todayDay = SsDay::query()
                ->where('status', 'published')
                ->orderByDesc('date')
                ->with('lesson.quarter')
                ->first();
        }

        $todayTarget = null;
        if ($todayDay && $todayDay->lesson && $todayDay->lesson->quarter) {
            $quarter = $todayDay->lesson->quarter;
            $todayTarget = [
                'year' => $quarter->year,
                'quarter' => $quarter->quarter,
                'lesson_number' => $todayDay->lesson->lesson_number,
                'day_key' => $todayDay->day_key,
                'date' => $todayDay->date,
            ];
        } elseif ($todayLesson && $activeQuarter) {
            $todayTarget = [
                'year' => $activeQuarter->year,
                'quarter' => $activeQuarter->quarter,
                'lesson_number' => $todayLesson->lesson_number,
                'day_key' => 'sun',
                'date' => $today->toDateString(),
            ];
        }

        return response()->json([
            'channels' => $nonSabbathChannels,
            'sabbathSchool' => [
                'channel' => $sabbathChannel,
                'activeQuarterId' => $activeQuarter?->id,
                'activeQuarter' => $activeQuarter,
                'quartersWithLessons' => $quartersWithLessons,
                'activeLessons' => $activeLessons->values(),
                'todayTarget' => $todayTarget,
            ],
        ]);
    }
}
