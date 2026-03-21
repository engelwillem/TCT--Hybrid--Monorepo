<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class TodayV2SessionContentSource
{
    /**
     * @return array<string, mixed>
     */
    public function resolve(): array
    {
        return $this->resolveWithMeta()['payload'];
    }

    /**
     * @return array{
     *     payload: array<string, mixed>,
     *     dateKey: string,
     *     sourceFile: string|null,
     *     fallbackUsed: bool
     * }
     */
    public function resolveWithMeta(?string $forcedDateKey = null): array
    {
        $dateKey = $this->resolveDateKey($forcedDateKey);
        $directory = $this->contentDirectory();
        $datedPath = $directory.DIRECTORY_SEPARATOR.$dateKey.'.php';

        $datedPayload = $this->loadFile($datedPath);
        if ($datedPayload !== []) {
            return [
                'payload' => $datedPayload,
                'dateKey' => $dateKey,
                'sourceFile' => $datedPath,
                'fallbackUsed' => false,
            ];
        }

        $defaultPath = $directory.DIRECTORY_SEPARATOR.$this->defaultFileName();
        $defaultPayload = $this->loadFile($defaultPath);
        if ($defaultPayload !== []) {
            return [
                'payload' => $defaultPayload,
                'dateKey' => $dateKey,
                'sourceFile' => $defaultPath,
                'fallbackUsed' => true,
            ];
        }

        Log::warning('today_v2.content_source.empty_payload', [
            'dateKey' => $dateKey,
            'datedPath' => $datedPath,
            'defaultPath' => $defaultPath,
        ]);

        return [
            'payload' => [],
            'dateKey' => $dateKey,
            'sourceFile' => null,
            'fallbackUsed' => true,
        ];
    }

    public function resolveDateKey(?string $forcedDateKey = null): string
    {
        if ($this->isValidDateKey($forcedDateKey ?? '')) {
            return (string) $forcedDateKey;
        }

        $override = trim((string) config('today_v2.date_override', ''));
        if ($this->isValidDateKey($override)) {
            return $override;
        }

        return Carbon::now($this->timezone())->format('Y-m-d');
    }

    private function contentDirectory(): string
    {
        $path = trim((string) config('today_v2.content_path', 'content/today-v2'));

        return base_path(trim($path, '/\\'));
    }

    private function defaultFileName(): string
    {
        $name = trim((string) config('today_v2.default_file', 'default.php'));

        return $name !== '' ? $name : 'default.php';
    }

    private function timezone(): string
    {
        $timezone = trim((string) config('today_v2.timezone', 'Asia/Jakarta'));

        return $timezone !== '' ? $timezone : 'Asia/Jakarta';
    }

    private function isValidDateKey(string $value): bool
    {
        return (bool) preg_match('/^\d{4}-\d{2}-\d{2}$/', $value);
    }

    /**
     * @return array<string, mixed>
     */
    private function loadFile(string $path): array
    {
        if (! is_file($path)) {
            return [];
        }

        $payload = include $path;
        if (! is_array($payload)) {
            Log::warning('today_v2.content_source.invalid_file_payload', ['path' => $path]);

            return [];
        }

        return $payload;
    }
}
