<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Analytics\ComposerAnalyticsIndexRequest;
use App\Services\Analytics\CommunityComposerAnalyticsService;
use Illuminate\Http\JsonResponse;

class CommunityComposerAnalyticsController extends Controller
{
    public function __construct(
        private readonly CommunityComposerAnalyticsService $analyticsService
    ) {
    }

    public function index(ComposerAnalyticsIndexRequest $request): JsonResponse
    {
        abort_unless((bool) ($request->user()?->is_admin ?? false), 403);

        $filters = [
            'timeframe' => (string) ($request->validated('timeframe') ?? '7d'),
            'postType' => (string) ($request->validated('postType') ?? 'all'),
            'media' => (string) ($request->validated('media') ?? 'all'),
        ];

        return response()->json($this->analyticsService->snapshot($filters));
    }
}
