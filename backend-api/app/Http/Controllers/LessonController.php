<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function show(Lesson $lesson): Response
    {
        // Placeholder page for now.
        return Inertia::render('Lessons/Show', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'day_number' => $lesson->day_number,
                'estimated_minutes' => $lesson->estimated_minutes,
            ],
        ]);
    }
}
