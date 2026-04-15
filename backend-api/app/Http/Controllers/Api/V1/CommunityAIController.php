<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AI\CommunityAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityAIController extends Controller
{
    public function assist(Request $request, CommunityAIService $service): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'string', 'in:compose_refine,compose_prayer_request,compose_structured_reflection,compose_title_caption,compose_verse_suggestions,reply_empathy,reply_prayer,moderate,tag,summarize'],
            'text' => ['required', 'string', 'min:2', 'max:6000'],
            'context' => ['nullable', 'array'],
        ]);

        $result = $service->assist(
            mode: (string) $validated['mode'],
            text: (string) $validated['text'],
            context: (array) ($validated['context'] ?? [])
        );

        return response()->json([
            'data' => $result,
        ]);
    }
}
