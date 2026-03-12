<?php

namespace App\Http\Controllers;

use App\Models\UserJournalDraft;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class JournalDraftController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'source_type' => ['nullable', 'string', 'max:24'],
            'source_ref' => ['nullable', 'string', 'max:64'],
            'entry_date' => ['nullable', 'date'],
        ]);

        $sourceType = Str::lower(trim((string) ($validated['source_type'] ?? 'versehub')));
        $sourceRef = trim((string) ($validated['source_ref'] ?? ''));
        $sourceRef = $sourceRef !== '' ? Str::lower($sourceRef) : null;
        $entryDate = isset($validated['entry_date'])
            ? Carbon::parse((string) $validated['entry_date'], 'Asia/Jakarta')->toDateString()
            : now('Asia/Jakarta')->toDateString();

        $draft = UserJournalDraft::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'entry_date' => $entryDate,
                'source_type' => $sourceType,
                'source_ref' => $sourceRef,
            ],
            [
                'body' => (string) $validated['body'],
                'is_private' => true,
            ]
        );

        return response()->json([
            'ok' => true,
            'id' => $draft->id,
            'entry_date' => $entryDate,
            'source_type' => $sourceType,
            'source_ref' => $sourceRef,
        ]);
    }
}

