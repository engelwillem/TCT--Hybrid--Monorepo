<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReflectionResponse;
use Inertia\Inertia;

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

        ReflectionResponse::create([
            'user_id' => $request->user()->id,
            'verse_ref' => $request->verse_ref,
            'question_text' => $request->question_text,
            'answer_text' => $request->answer_text,
            'is_private' => $request->is_private ?? true,
        ]);

        return back()->with('success', $lang === 'id' ? 'Refleksi tersimpan.' : 'Reflection saved.');
    }

    /**
     * Display the user's reflection history.
     */
    public function index(Request $request, string $lang)
    {
        $reflections = ReflectionResponse::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('VerseHub/MySpiritualJourney', [
            'lang' => $lang,
            'reflections' => $reflections,
        ]);
    }
}
