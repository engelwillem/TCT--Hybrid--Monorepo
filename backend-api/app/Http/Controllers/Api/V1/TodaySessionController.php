<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TodaySessionResource;
use App\Support\TodaySessionContentSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodaySessionController extends Controller
{
    public function show(Request $request, TodaySessionContentSource $contentSource): JsonResponse
    {
        $previewDate = $this->resolvePreviewDate($request);
        $resolved = $contentSource->resolveWithMeta($previewDate);

        $response = response()->json(
            TodaySessionResource::make($resolved['payload'])->resolve()
        );

        if ($previewDate !== null) {
            $response->headers->set('X-Today-Preview-Date', $resolved['dateKey']);
            $response->headers->set('X-Today-Preview-Fallback', $resolved['fallbackUsed'] ? '1' : '0');
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
            || (bool) config('today.allow_preview_query', false);
    }
}


