<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TodayFeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TodayApiController extends Controller
{
    /**
     * Show the Today Dashboard data.
     * Integrated with TodayFeedService for real hybrid data parity.
     */
    public function show(TodayFeedService $feedService): JsonResponse
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::guard('sanctum')->user();
        
        // getTodayData returns both rituals and the calculated hybrid feed
        $data = $feedService->getTodayData($user);

        return response()->json([
            'data' => [
                'dailyVerse' => $data['rituals']['today_verse'] ?? null,
                'rituals' => $data['rituals'],
                'highlights' => $data['feed'],
                'spiritual_state' => $user?->spiritual_state ?? 'fresh',
            ],
        ]);
    }

    public function updateState(\Illuminate\Http\Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::guard('sanctum')->user();
        
        $validated = $request->validate([
            'state' => 'required|string|in:fresh,anxious,grateful,weary,on-fire',
        ]);
        
        $user->spiritual_state = $validated['state'];
        $user->save();
        
        return response()->json([
            'status' => 'success',
            'state' => $user->spiritual_state,
        ]);
    }
}
