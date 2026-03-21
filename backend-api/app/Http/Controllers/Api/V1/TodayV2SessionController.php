<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TodayV2SessionResource;
use App\Support\TodayV2SessionContentSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodayV2SessionController extends Controller
{
    public function show(Request $request, TodayV2SessionContentSource $contentSource): JsonResponse
    {
        $previewDate = $this->resolvePreviewDate($request);
        $resolved = $contentSource->resolveWithMeta($previewDate);

        $response = response()->json(
            TodayV2SessionResource::make($resolved['payload'])->resolve()
        );

        if ($previewDate !== null) {
            $response->headers->set('X-Today-V2-Preview-Date', $resolved['dateKey']);
            $response->headers->set('X-Today-V2-Preview-Fallback', $resolved['fallbackUsed'] ? '1' : '0');
        }

        return $response;
    }

    private function resolvePreviewDate(Request $request): ?string
    {
        if (! $this->isPreviewQueryAllowed()) {
            return null;
        }

        $value = trim((string) $request->query('previewDate', ''));
        if ($value === '') {
            return null;
        }

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1 ? $value : null;
    }

    private function isPreviewQueryAllowed(): bool
    {
        return app()->isLocal()
            || app()->environment('testing')
            || (bool) config('today_v2.allow_preview_query', false);
    }
}
