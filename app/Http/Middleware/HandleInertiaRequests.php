<?php

namespace App\Http\Middleware;

use App\Services\InboxService;
use App\Support\AppSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // PERFORMANCE NOTE:
        // Keep shared props small. We include unreadCount + a small recent list for popover/popup UX.
        $sharedNotifications = null;
        $sharedInbox = null;
        if ($user) {
            // Avoid hitting DB on every navigation. Short TTL keeps UI fresh while reducing load.
            $notificationPayload = Cache::remember(
                "notifications:payload:user:{$user->id}",
                now()->addSeconds(8),
                function () use ($user): array {
                    $items = $user->notifications()
                        ->latest()
                        ->limit(8)
                        ->get()
                        ->map(fn ($n) => [
                            'id' => (string) $n->id,
                            'type' => (string) $n->type,
                            'data' => is_array($n->data) ? $n->data : [],
                            'readAt' => optional($n->read_at)?->toISOString(),
                            'createdAt' => optional($n->created_at)?->toISOString(),
                        ])
                        ->values()
                        ->all();

                    return [
                        'unreadCount' => (int) $user->unreadNotifications()->count(),
                        'items' => $items,
                    ];
                },
            );

            $sharedNotifications = [
                'unreadCount' => (int) ($notificationPayload['unreadCount'] ?? 0),
                'items' => is_array($notificationPayload['items'] ?? null)
                    ? $notificationPayload['items']
                    : [],
            ];

            $sharedInbox = Cache::remember(
                "inbox:payload:user:{$user->id}",
                now()->addSeconds(8),
                fn () => app(InboxService::class)->build($user),
            );
        }

        return [
            ...parent::share($request),
            'auth' => [
                // Keep shared props small so navigation feels snappy.
                'user' => $user
                    ? [
                        ...$user->only(['id', 'name', 'email', 'is_admin', 'is_it', 'email_verified_at']),
                        // Use a relative URL so it works even when APP_URL differs from the current host
                        // (e.g. local dev via http://127.0.0.1:8000 while APP_URL=http://localhost).
                        'avatarUrl' => $user->avatar_path
                            ? '/storage/'.$user->avatar_path
                            : null,
                        'avatarInitials' => collect(explode(' ', (string) $user->name))
                            ->filter()
                            ->take(2)
                            ->map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)))
                            ->implode(''),
                    ]
                    : null,
            ],
            'notifications' => $sharedNotifications,
            'inbox' => $sharedInbox,
            'ui' => [
                'appName' => config('app.name'),
                'communityName' => config('ui.community_name'),
                'tagline' => config('ui.tagline'),
                'officialDomain' => config('ui.official_domain'),
                'brand' => [
                    'hsl' => config('ui.brand_hsl'),
                    'foregroundHsl' => config('ui.brand_foreground_hsl'),
                ],
                'announcements' => config('ui.announcements', []),
                'assets' => [
                    'favicon' => AppSettings::get('site.favicon_url', '/favicon.svg'),
                    'channelsCoverFallback' => AppSettings::get(
                        'site.channels_cover_fallback',
                        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop'
                    ),
                    'sabbathCoverFallback' => AppSettings::get(
                        'site.sabbath_cover_fallback',
                        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
                    ),
                    'sabbathCoversByDay' => [
                        'sat' => AppSettings::get('site.sabbath_sat_cover'),
                        'sun' => AppSettings::get('site.sabbath_sun_cover'),
                        'mon' => AppSettings::get('site.sabbath_mon_cover'),
                        'tue' => AppSettings::get('site.sabbath_tue_cover'),
                        'wed' => AppSettings::get('site.sabbath_wed_cover'),
                        'thu' => AppSettings::get('site.sabbath_thu_cover'),
                        'fri' => AppSettings::get('site.sabbath_fri_cover'),
                    ],
                ],
            ],
        ];
    }
}
