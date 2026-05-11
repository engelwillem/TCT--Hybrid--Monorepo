<?php

namespace App\Providers;

use App\Filament\Auth\Responses\AdminLoginResponse;
use App\Events\Community\PostRepostedToTalks;
use App\Listeners\Community\InvalidateCommunityPostCaches;
use App\Listeners\Community\RecordPostRepostedAnalytics;
use App\Services\AI\AIProviderInterface;
use App\Services\AI\NullAIProvider;
use App\Services\AI\OpenAIResponsesClient;
use App\Services\Onboarding\Adapters\MockCalendarAdapter;
use App\Services\Onboarding\Adapters\MockCrmSyncAdapter;
use App\Services\Onboarding\Adapters\WebhookCalendarAdapter;
use App\Services\Onboarding\Adapters\WebhookCrmSyncAdapter;
use App\Services\Onboarding\Contracts\CalendarAdapterInterface;
use App\Services\Onboarding\Contracts\CrmSyncAdapterInterface;
use App\Services\Mentor\ClaudeMentorDriver;
use App\Services\Mentor\MentorDriverInterface;
use App\Services\Mentor\OpenAIMentorDriver;
use App\Services\Mentor\TemplateMentorDriver;
use App\Support\RichContentSanitizer;
use Filament\Auth\Http\Responses\Contracts\LoginResponse as FilamentLoginResponseContract;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(HtmlSanitizerInterface::class, function (): HtmlSanitizer {
            $config = (new HtmlSanitizerConfig())
                ->allowSafeElements()
                ->allowElement('div')
                ->allowElement('span')
                ->allowElement('section')
                ->allowElement('figure')
                ->allowElement('figcaption')
                ->allowElement('img', ['src', 'alt', 'title', 'width', 'height'])
                ->allowAttribute('target', ['a'])
                ->allowAttribute('aria-label', '*')
                ->forceAttribute('a', 'rel', 'noopener noreferrer')
                ->allowLinkSchemes(['https', 'http', 'mailto', 'tel'])
                ->allowMediaSchemes(['https', 'http'])
                ->allowRelativeLinks()
                ->allowRelativeMedias();

            return new HtmlSanitizer($config);
        });

        $this->app->singleton(RichContentSanitizer::class);
        $this->app->bind(AIProviderInterface::class, function () {
            $provider = strtolower((string) config('ai.provider', 'openai'));

            if ($provider === 'openai') {
                return $this->app->make(OpenAIResponsesClient::class);
            }

            return $this->app->make(NullAIProvider::class);
        });

        $this->app->bind(CrmSyncAdapterInterface::class, function () {
            $mode = strtolower((string) config('onboarding.integrations.mode', 'mock'));

            return $mode === 'real'
                ? $this->app->make(WebhookCrmSyncAdapter::class)
                : $this->app->make(MockCrmSyncAdapter::class);
        });

        $this->app->bind(CalendarAdapterInterface::class, function () {
            $mode = strtolower((string) config('onboarding.integrations.mode', 'mock'));

            return $mode === 'real'
                ? $this->app->make(WebhookCalendarAdapter::class)
                : $this->app->make(MockCalendarAdapter::class);
        });

        // Override Filament login response so we can send security notifications.
        $this->app->bind(FilamentLoginResponseContract::class, AdminLoginResponse::class);

        $this->app->bind(MentorDriverInterface::class, function () {
            $configuredDriver = strtolower((string) config('versehub_mentor.driver', 'template'));
            $openAIKeyConfigured = trim((string) config('versehub_mentor.openai.api_key')) !== '';
            $claudeKeyConfigured = trim((string) config('versehub_mentor.claude.api_key')) !== '';
            $autoEnableOpenAI = (bool) config('versehub_mentor.auto_enable_openai_when_key_present', true);

            if ($configuredDriver === 'auto') {
                $configuredDriver = $openAIKeyConfigured ? 'openai' : 'template';
            }

            if ($configuredDriver === 'template' && $autoEnableOpenAI && $openAIKeyConfigured) {
                $configuredDriver = 'openai';
            }

            if ($configuredDriver === 'openai') {
                if ($openAIKeyConfigured) {
                    return $this->app->make(OpenAIMentorDriver::class);
                }

                return $this->app->make(TemplateMentorDriver::class);
            }

            if ($configuredDriver === 'claude') {
                if ($claudeKeyConfigured) {
                    return $this->app->make(ClaudeMentorDriver::class);
                }

                return $this->app->make(TemplateMentorDriver::class);
            }

            return $this->app->make(TemplateMentorDriver::class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            $cacheStore = (string) config('cache.default', '');
            if (! in_array($cacheStore, ['redis', 'database'], true)) {
                Log::warning('share_prepare.rate_limit_store_not_shared', [
                    'cache_store' => $cacheStore,
                    'environment' => (string) config('app.env'),
                ]);
            }
        }

        RateLimiter::for('share-prepare', function (Request $request): array {
            $surface = self::resolveSharePrepareSurface($request);
            $actorKey = self::resolveSharePrepareActorKey($request);
            $thresholds = self::sharePrepareThresholds($surface);
            $routeUri = $request->route()?->uri() ?? $request->path();
            $requestId = (string) (
                $request->header('x-request-id')
                ?? $request->header('x-renungan-request-id')
                ?? Str::uuid()
            );
            $ipHash = self::hashClientFingerprint($request);

            $response = static function (Request $request, array $headers) use ($surface, $actorKey, $routeUri, $requestId, $ipHash) {
                $retryAfter = (int) ($headers['Retry-After'] ?? $headers['retry-after'] ?? 0);

                Log::warning('share_prepare.throttled', [
                    'surface' => $surface,
                    'route' => $routeUri,
                    'user_id' => $request->user()?->id,
                    'actor_key' => $actorKey,
                    'ip_hash' => $ipHash,
                    'retry_after' => $retryAfter,
                    'request_id' => $requestId,
                ]);

                return response()->json([
                    'message' => 'Too many share prepare requests. Please retry shortly.',
                    'code' => 'SHARE_PREPARE_RATE_LIMITED',
                    'status' => 429,
                    'retry_after' => $retryAfter,
                    'request_id' => $requestId,
                ], 429, $headers);
            };

            return [
                Limit::perMinute($thresholds['per_minute'])
                    ->by("share-prepare:{$surface}:{$actorKey}:m1")
                    ->response($response),
                Limit::perSecond($thresholds['burst_per_10_seconds'], 10)
                    ->by("share-prepare:{$surface}:{$actorKey}:s10")
                    ->response($response),
            ];
        });

        Event::listen(PostRepostedToTalks::class, RecordPostRepostedAnalytics::class);
        Event::listen(PostRepostedToTalks::class, InvalidateCommunityPostCaches::class);

        // Prefetching can feel "heavy" on local/dev or low-end devices because
        // it injects many <link rel="prefetch"> tags and loads them (waterfall).
        // Disable it for local so navigation feels instant again.
        if (! app()->isLocal()) {
            Vite::prefetch(concurrency: 3);
        }

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $baseUrl = rtrim(env('NEXT_PUBLIC_APP_URL', 'http://localhost:9002'), '/');
            $query = http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);

            return "{$baseUrl}/reset-password?{$query}";
        });
    }

    /**
     * @return array{per_minute:int, burst_per_10_seconds:int}
     */
    private static function sharePrepareThresholds(string $surface): array
    {
        $defaults = [
            'community' => ['per_minute' => 8, 'burst_per_10_seconds' => 3],
            'renungan' => ['per_minute' => 6, 'burst_per_10_seconds' => 2],
            'versehub' => ['per_minute' => 12, 'burst_per_10_seconds' => 4],
        ];

        $configured = config("share_assets.rate_limit.{$surface}", []);

        return [
            'per_minute' => max(1, (int) ($configured['per_minute'] ?? $defaults[$surface]['per_minute'] ?? 8)),
            'burst_per_10_seconds' => max(1, (int) ($configured['burst_per_10_seconds'] ?? $defaults[$surface]['burst_per_10_seconds'] ?? 3)),
        ];
    }

    private static function resolveSharePrepareSurface(Request $request): string
    {
        $routeName = (string) ($request->route()?->getName() ?? '');

        $surface = match ($routeName) {
            'community.share.prepare' => 'community',
            'renungan.share.prepare' => 'renungan',
            'versehub.share.prepare' => 'versehub',
            default => 'unknown',
        };

        if ($surface === 'unknown') {
            Log::warning('share_prepare.unknown_surface_route', [
                'route_name' => $routeName,
                'path' => (string) $request->path(),
                'method' => $request->method(),
            ]);
        }

        return $surface;
    }

    private static function resolveSharePrepareActorKey(Request $request): string
    {
        $userId = $request->user()?->id;
        if ($userId !== null) {
            return "user:{$userId}";
        }

        return 'ip:'.self::hashClientFingerprint($request);
    }

    private static function hashClientFingerprint(Request $request): string
    {
        $payload = implode('|', [
            (string) ($request->ip() ?? 'unknown'),
            (string) substr((string) ($request->userAgent() ?? ''), 0, 120),
            (string) config('app.key', 'tct'),
        ]);

        return substr(hash('sha256', $payload), 0, 16);
    }
}
