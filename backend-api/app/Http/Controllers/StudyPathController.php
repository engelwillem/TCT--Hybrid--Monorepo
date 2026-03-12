<?php

namespace App\Http\Controllers;

use App\Models\StudyPath;
use App\Models\UserStudyPathProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudyPathController extends Controller
{
    /**
     * List all active study paths.
     */
    public function index(Request $request, string $lang)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $paths = StudyPath::where('is_published', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        if ($request->expectsJson()) {
            return response()->json([
                'lang' => $lang,
                'paths' => $paths,
            ]);
        }

        return Inertia::render('VerseHub/StudyPaths/Index', [
            'lang' => $lang,
            'paths' => $paths,
        ]);
    }

    /**
     * Show a specific study path and its steps.
     */
    public function show(Request $request, string $lang, string $slug)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $path = StudyPath::where('slug', $slug)
            ->with(['steps'])
            ->firstOrFail();

        $userProgress = [];
        if ($request->user()) {
            $progress = UserStudyPathProgress::where('user_id', $request->user()->id)
                ->where('path_id', $path->id)
                ->first();

            $lastStepOrder = (int) ($progress?->last_step_order ?? 0);
            if ($lastStepOrder > 0) {
                $userProgress = $path->steps
                    ->filter(fn($step) => (int) $step->step_order <= $lastStepOrder)
                    ->pluck('id')
                    ->values()
                    ->all();
            }
        }

        $title = $lang === 'id' ? $path->title_id : $path->title_en;
        $description = $lang === 'id' ? $path->description_id : $path->description_en;
        $canonicalUrl = url("/versehub/{$lang}/study/{$path->slug}");
        $ogImageUrl = url("/versehub/{$lang}/study/{$path->slug}/og.png");

        if ($request->expectsJson()) {
            return response()->json([
                'lang' => $lang,
                'path' => $path,
                'userProgress' => $userProgress,
                'meta' => [
                    'title' => $title,
                    'description' => $description,
                    'canonical_url' => $canonicalUrl,
                    'og_image_url' => $ogImageUrl,
                ],
            ]);
        }

        return Inertia::render('VerseHub/StudyPaths/Show', [
            'lang' => $lang,
            'path' => $path,
            'userProgress' => $userProgress,
            'meta' => [
                'title' => $title,
                'description' => $description,
                'canonical_url' => $canonicalUrl,
                'og_image_url' => $ogImageUrl,
            ],
        ]);
    }

    /**
     * Join a study path (Auth required).
     */
    public function join(Request $request, string $lang, string $slug)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);
        $user = $request->user();
        abort_unless($user, 403);

        $path = StudyPath::where('slug', $slug)->firstOrFail();

        // Optional: Logic to track overall path enrollment state
        // For now, completion of first step effectively joins the path.

        if ($request->expectsJson()) {
            return response()->json([
                'ok' => true,
                'status' => 'joined',
                'path' => [
                    'id' => $path->id,
                    'slug' => $path->slug,
                ],
            ]);
        }

        return back()->with('success', 'Joined the study path!');
    }

    /**
     * Mark a step as complete and update progress.
     */
    public function completeStep(Request $request, string $lang, string $slug, int $stepId)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);
        $user = $request->user();
        abort_unless($user, 403);

        $path = StudyPath::where('slug', $slug)
            ->with(['steps'])
            ->firstOrFail();

        $step = $path->steps->firstWhere('id', $stepId);
        abort_unless($step !== null, 404);

        $stepOrder = (int) $step->step_order;
        $maxStepOrder = (int) $path->steps->max('step_order');

        $progress = UserStudyPathProgress::firstOrNew([
            'user_id' => $user->id,
            'path_id' => $path->id,
        ]);

        $progress->last_step_order = max((int) ($progress->last_step_order ?? 0), $stepOrder);
        if ($maxStepOrder > 0 && (int) $progress->last_step_order >= $maxStepOrder) {
            $progress->completed_at = now();
        }
        $progress->save();

        $completedStepIds = $path->steps
            ->filter(fn($item) => (int) $item->step_order <= (int) $progress->last_step_order)
            ->pluck('id')
            ->values()
            ->all();

        if ($request->expectsJson()) {
            return response()->json([
                'ok' => true,
                'progress' => [
                    'last_step_order' => (int) $progress->last_step_order,
                    'completed_at' => optional($progress->completed_at)?->toISOString(),
                    'completed_step_ids' => $completedStepIds,
                ],
            ]);
        }

        return back();
    }

    /**
     * Generate a premium OG image for the study path.
     */
    public function ogImage(Request $request, string $lang, string $slug)
    {
        abort_unless(in_array($lang, ['id', 'en'], true), 404);

        $path = StudyPath::where('slug', $slug)->firstOrFail();

        $title = $lang === 'id' ? $path->title_id : $path->title_en;
        $description = $lang === 'id' ? $path->description_id : $path->description_en;

        $controller = new VerseHubController();
        $png = $controller->renderStudyPathOg($title, $description, $path->cover_color);

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
