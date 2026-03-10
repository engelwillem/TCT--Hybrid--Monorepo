<?php

namespace App\Http\Controllers;

use App\Http\Requests\StartLessonRequest;
use App\Models\Lesson;
use App\Models\UserLessonProgress;
use Illuminate\Support\Carbon;

class LessonProgressController extends Controller
{
    public function start(StartLessonRequest $request, Lesson $lesson)
    {
        $user = $request->user();

        /** @var UserLessonProgress $progress */
        $progress = UserLessonProgress::query()->firstOrCreate(
            [
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'started_at' => Carbon::now(),
            ],
        );

        // If already created but started_at is empty, fill it.
        if (! $progress->started_at) {
            $progress->forceFill(['started_at' => Carbon::now()])->save();
        }

        return redirect()->to(route('lessons.show', ['lesson' => $lesson->id], false));
    }

    // Optional stub for later.
    public function complete(StartLessonRequest $request, Lesson $lesson)
    {
        abort(501);
    }
}
