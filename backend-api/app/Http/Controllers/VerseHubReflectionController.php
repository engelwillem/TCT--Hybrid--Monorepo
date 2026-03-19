<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReflectionResponse;

class VerseHubReflectionController extends Controller
{
    /**
     * Store a new reflection response.
     */
    public function store(Request $request, string $lang)
    {
        $request->validate([
            'verse_ref' => 'required|string',
            'question_text' => 'required|string',
            'answer_text' => 'required|string',
            'is_private' => 'boolean',
        ]);

        $reflection = ReflectionResponse::create([
            'user_id' => $request->user()->id,
            'verse_ref' => $request->verse_ref,
            'question_text' => $request->question_text,
            'answer_text' => $request->answer_text,
            'is_private' => $request->is_private ?? true,
        ]);

        return response()->json([
            'data' => [
                'id' => (string) $reflection->id,
                'verse_ref' => (string) $reflection->verse_ref,
                'question_text' => (string) $reflection->question_text,
                'answer_text' => (string) $reflection->answer_text,
                'is_private' => (bool) $reflection->is_private,
                'created_at' => optional($reflection->created_at)?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Display the user's reflection history.
     */
    public function index(Request $request, string $lang)
    {
        $reflections = ReflectionResponse::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => [
                'items' => $reflections->items(),
                'meta' => [
                    'current_page' => $reflections->currentPage(),
                    'last_page' => $reflections->lastPage(),
                    'per_page' => $reflections->perPage(),
                    'total' => $reflections->total(),
                ],
            ],
        ]);
    }
}
