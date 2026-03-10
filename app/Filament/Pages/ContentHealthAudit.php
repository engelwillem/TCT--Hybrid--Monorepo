<?php

namespace App\Filament\Pages;

use App\Models\AdminAuditLog;
use App\Filament\Resources\Channels\ChannelResource;
use App\Filament\Resources\MemberPostComments\MemberPostCommentResource;
use App\Filament\Resources\MemberPosts\MemberPostResource;
use App\Filament\Resources\Posts\PostResource;
use App\Filament\Resources\SsDays\SsDayResource;
use App\Filament\Resources\SsLessons\SsLessonResource;
use App\Filament\Resources\SsQuarters\SsQuarterResource;
use App\Models\Channel;
use App\Models\MemberPost;
use App\Models\MemberPostComment;
use App\Models\Post;
use App\Models\SsDay;
use App\Models\SsDayComment;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use App\Models\User;
use App\Models\UserMetric;
use App\Models\UserVerseAction;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use UnitEnum;

class ContentHealthAudit extends Page
{
    private const ACTION_COOLDOWN_SECONDS = [
        'fixCritical' => 60,
        'ensureCoreChannels' => 20,
        'createTodayDailyVerse' => 30,
        'ensureSabbathSeed' => 30,
        'exportAuditTrailCsv' => 10,
    ];

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-shield-check';

    protected static string|UnitEnum|null $navigationGroup = 'Utilities (IT Only)';

    protected static ?string $navigationLabel = 'Content Health Audit';

    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.content-health-audit';

    /** @var array<int, array<string, mixed>> */
    public array $sections = [];

    /** @var array<int, array<string, mixed>> */
    public array $recentLogs = [];

    /** @var array{action:string,user_id:string,date_from:string,date_to:string} */
    public array $logFilters = [
        'action' => '',
        'user_id' => '',
        'date_from' => '',
        'date_to' => '',
    ];

    /** @var array<int, array{id:int,label:string}> */
    public array $logUsers = [];

    /** @var array<int, array{issue:string,count:int,last_fixed_at:string}> */
    public array $criticalTopIssues = [];

    /** @var array<int, array{title:string,description:string,method:string,priority:string}> */
    public array $recommendedActions = [];

    public ?string $pendingConfirmAction = null;

    public string $pendingConfirmLabel = '';

    public string $pendingConfirmDescription = '';

    public string $generatedAt = '';

    /** @var array<string, int> */
    public array $actionCooldowns = [];

    public static function shouldRegisterNavigation(): bool
    {
        $user = Filament::auth()->user();

        return (bool) ($user?->is_it ?? false);
    }

    public static function canAccess(): bool
    {
        $user = Filament::auth()->user();

        return (bool) (($user?->is_admin ?? false) && ($user?->is_it ?? false));
    }

    public function mount(): void
    {
        $this->buildAudit();
        $this->loadLogUsers();
        $this->loadRecentLogs();
        $this->loadCriticalTopIssues();
        $this->loadRecommendedActions();
        $this->refreshCooldownState();
    }

    public function refreshAudit(): void
    {
        $this->buildAudit();
        $this->loadLogUsers();
        $this->loadRecentLogs();
        $this->loadCriticalTopIssues();
        $this->loadRecommendedActions();
        $this->refreshCooldownState();
    }

    public function refreshCooldownState(): void
    {
        $map = [];
        foreach (array_keys(self::ACTION_COOLDOWN_SECONDS) as $action) {
            $map[$action] = $this->getCooldownRemaining($action);
        }
        $this->actionCooldowns = $map;
    }

    public function updatedLogFilters(): void
    {
        $this->loadRecentLogs();
    }

    public function ensureCoreChannels(): void
    {
        if (! $this->guardAdmin('ensure_core_channels')) {
            return;
        }
        if (! $this->enforceActionCooldown('ensureCoreChannels', self::ACTION_COOLDOWN_SECONDS['ensureCoreChannels'])) {
            return;
        }

        $result = $this->ensureCoreChannelsInternal();

        $this->buildAudit();
        $this->loadRecentLogs();
        $this->loadCriticalTopIssues();
        $this->loadRecommendedActions();
        $this->logAction('ensure_core_channels', $result);

        Notification::make()
            ->title('Core channel check selesai')
            ->body($result['created'] > 0
                ? "{$result['created']} channel dibuat oleh ".($this->actorLabel())."."
                : 'Tidak ada channel baru. Semua sudah tersedia. Actor: '.($this->actorLabel()).'.')
            ->success()
            ->send();
    }

    public function createTodayDailyVerse(): void
    {
        if (! $this->guardAdmin('create_today_daily_verse')) {
            return;
        }
        if (! $this->enforceActionCooldown('createTodayDailyVerse', self::ACTION_COOLDOWN_SECONDS['createTodayDailyVerse'])) {
            return;
        }

        $result = $this->createTodayDailyVerseInternal();
        $this->buildAudit();
        $this->loadRecentLogs();
        $this->loadCriticalTopIssues();
        $this->loadRecommendedActions();
        $this->logAction('create_today_daily_verse', $result);

        if (! ($result['created'] ?? false)) {
            Notification::make()
                ->title('Daily verse hari ini sudah ada')
                ->body('Tidak dibuat ulang agar tetap unik per hari. Actor: '.($this->actorLabel()).'.')
                ->warning()
                ->send();

            return;
        }

        Notification::make()
            ->title('Daily verse hari ini dibuat')
            ->body("Published: {$result['reference']} | Actor: ".($this->actorLabel()))
            ->success()
            ->send();
    }

    public function ensureSabbathSeed(): void
    {
        if (! $this->guardAdmin('ensure_sabbath_seed')) {
            return;
        }
        if (! $this->enforceActionCooldown('ensureSabbathSeed', self::ACTION_COOLDOWN_SECONDS['ensureSabbathSeed'])) {
            return;
        }

        $result = $this->ensureSabbathSeedInternal();
        $this->buildAudit();
        $this->loadRecentLogs();
        $this->loadCriticalTopIssues();
        $this->loadRecommendedActions();
        $this->logAction('ensure_sabbath_seed', $result);

        Notification::make()
            ->title('Sabbath School seed selesai')
            ->body("Quarter {$result['quarter']}, Lesson 1, day 'sat' dipastikan tersedia. Actor: ".($this->actorLabel()))
            ->success()
            ->send();
    }

    public function fixCritical(): void
    {
        if (! $this->guardAdmin('fix_critical')) {
            return;
        }
        if (! $this->enforceActionCooldown('fixCritical', self::ACTION_COOLDOWN_SECONDS['fixCritical'])) {
            return;
        }

        $fixed = [];

        $requiredCoreSlugs = ['faith-journey', 'family', 'god-first', 'versehub-daily'];
        $existingCoreSlugs = Channel::query()
            ->whereIn('slug', $requiredCoreSlugs)
            ->pluck('slug')
            ->all();
        $missingCoreSlugs = array_values(array_diff($requiredCoreSlugs, $existingCoreSlugs));
        if (! empty($missingCoreSlugs)) {
            $core = $this->ensureCoreChannelsInternal();
            $fixed[] = "core_channels(+{$core['created']})";
        }

        $todayJkt = Carbon::now('Asia/Jakarta')->toDateString();
        $dailyVerseTodayCount = Post::query()
            ->whereHas('channel', fn ($q) => $q->where('slug', 'versehub-daily'))
            ->where('status', 'published')
            ->where('meta->kind', 'versehub_daily')
            ->where(function ($q) use ($todayJkt) {
                $q->whereDate('publish_at', $todayJkt)
                    ->orWhere(function ($q2) use ($todayJkt) {
                        $q2->whereNull('publish_at')->whereDate('created_at', $todayJkt);
                    });
            })
            ->count();
        if ($dailyVerseTodayCount === 0) {
            $daily = $this->createTodayDailyVerseInternal();
            if ($daily['created']) {
                $fixed[] = 'daily_verse(today)';
            }
        }

        $activeSsQuarter = SsQuarter::query()->where('is_active', true)->exists();
        if (! $activeSsQuarter) {
            $seed = $this->ensureSabbathSeedInternal();
            $fixed[] = 'sabbath_seed('.$seed['quarter'].')';
        }

        $this->buildAudit();
        $this->loadRecentLogs();
        $this->loadCriticalTopIssues();
        $this->loadRecommendedActions();
        $this->logAction('fix_critical', ['fixed' => $fixed]);

        Notification::make()
            ->title('Fix critical selesai')
            ->body(empty($fixed)
                ? 'Tidak ada kondisi CRITICAL yang perlu diperbaiki. Actor: '.($this->actorLabel()).'.'
                : 'Perbaikan: '.implode(', ', $fixed).' | Actor: '.($this->actorLabel()))
            ->success()
            ->send();
    }

    public function resetLogFilters(): void
    {
        $this->logFilters = [
            'action' => '',
            'user_id' => '',
            'date_from' => '',
            'date_to' => '',
        ];

        $this->loadRecentLogs();
        $this->loadCriticalTopIssues();
        $this->loadRecommendedActions();
    }

    public function exportAuditTrailCsv()
    {
        if (! $this->guardAdmin('export_audit_trail_csv')) {
            return null;
        }
        if (! $this->enforceActionCooldown('exportAuditTrailCsv', self::ACTION_COOLDOWN_SECONDS['exportAuditTrailCsv'])) {
            return null;
        }

        if (! Schema::hasTable('admin_audit_logs')) {
            Notification::make()
                ->title('Audit log belum tersedia')
                ->body('Tabel admin_audit_logs belum ada.')
                ->warning()
                ->send();

            return null;
        }

        $rows = $this->buildLogQuery()
            ->with('user:id,name,email')
            ->orderByDesc('id')
            ->limit(5000)
            ->get();

        if ($rows->isEmpty()) {
            Notification::make()
                ->title('Tidak ada data untuk diexport')
                ->body('Sesuaikan filter lalu coba lagi.')
                ->warning()
                ->send();

            return null;
        }

        $filename = 'admin-audit-trail-' . Carbon::now('Asia/Jakarta')->format('Ymd-His') . '.csv';

        $callback = function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            if (! $handle) {
                return;
            }

            fputcsv($handle, ['id', 'action', 'user', 'email', 'details_json', 'created_at_wib']);

            foreach ($rows as $log) {
                fputcsv($handle, [
                    $log->id,
                    (string) $log->action,
                    (string) ($log->user?->name ?? 'System'),
                    (string) ($log->user?->email ?? ''),
                    json_encode($log->details ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    (string) $log->created_at?->timezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function requestActionConfirm(string $action): void
    {
        $map = $this->actionMap();
        if (! isset($map[$action])) {
            Notification::make()
                ->title('Aksi tidak dikenali')
                ->body('Silakan refresh halaman audit lalu coba lagi.')
                ->danger()
                ->send();

            return;
        }

        if (! $this->guardAdmin('request_'.$action)) {
            return;
        }
        if ($this->getCooldownRemaining($action) > 0) {
            $remaining = $this->getCooldownRemaining($action);
            Notification::make()
                ->title('Action cooldown aktif')
                ->body("Tunggu {$remaining} detik sebelum menjalankan aksi ini lagi.")
                ->warning()
                ->send();

            return;
        }

        $this->pendingConfirmAction = $action;
        $this->pendingConfirmLabel = $map[$action]['label'];
        $this->pendingConfirmDescription = $map[$action]['description'];
    }

    public function cancelActionConfirm(): void
    {
        $this->pendingConfirmAction = null;
        $this->pendingConfirmLabel = '';
        $this->pendingConfirmDescription = '';
    }

    public function confirmAction()
    {
        $action = $this->pendingConfirmAction;
        if (! $action) {
            return null;
        }

        $this->cancelActionConfirm();

        return match ($action) {
            'fixCritical' => $this->fixCritical(),
            'ensureCoreChannels' => $this->ensureCoreChannels(),
            'createTodayDailyVerse' => $this->createTodayDailyVerse(),
            'ensureSabbathSeed' => $this->ensureSabbathSeed(),
            'refreshAudit' => $this->refreshAudit(),
            'resetLogFilters' => $this->resetLogFilters(),
            'exportAuditTrailCsv' => $this->exportAuditTrailCsv(),
            default => Notification::make()
                ->title('Aksi tidak valid')
                ->body('Action key tidak terdaftar.')
                ->danger()
                ->send(),
        };
    }

    private function buildAudit(): void
    {
        $nowJkt = Carbon::now('Asia/Jakarta');
        $todayJkt = $nowJkt->toDateString();
        $this->generatedAt = $nowJkt->translatedFormat('d M Y H:i') . ' WIB';

        $requiredWeeklySlugs = ['faith-journey', 'family', 'god-first'];
        $requiredCoreSlugs = [...$requiredWeeklySlugs, 'versehub-daily'];
        $existingCoreSlugs = Channel::query()
            ->whereIn('slug', $requiredCoreSlugs)
            ->pluck('slug')
            ->all();
        $missingCoreSlugs = array_values(array_diff($requiredCoreSlugs, $existingCoreSlugs));

        $weeklyPublishedCount = Post::query()
            ->whereHas('channel', fn ($q) => $q->whereIn('slug', $requiredWeeklySlugs))
            ->where('status', 'published')
            ->where(function ($q) use ($nowJkt) {
                $q->whereNull('publish_at')->orWhere('publish_at', '<=', $nowJkt);
            })
            ->count();

        $dailyVerseBase = Post::query()
            ->whereHas('channel', fn ($q) => $q->where('slug', 'versehub-daily'))
            ->where('status', 'published')
            ->where('meta->kind', 'versehub_daily');

        $dailyVerseTodayCount = (clone $dailyVerseBase)
            ->where(function ($q) use ($todayJkt) {
                $q->whereDate('publish_at', $todayJkt)
                    ->orWhere(function ($q2) use ($todayJkt) {
                        $q2->whereNull('publish_at')->whereDate('created_at', $todayJkt);
                    });
            })
            ->count();

        $activeSsQuarter = SsQuarter::query()
            ->where('is_active', true)
            ->orderByDesc('start_date')
            ->first();

        $ssLessonsInActiveQuarter = $activeSsQuarter
            ? SsLesson::query()->where('quarter_id', $activeSsQuarter->id)->count()
            : 0;

        $ssPublishedDaysInActiveQuarter = $activeSsQuarter
            ? SsDay::query()
                ->whereIn('lesson_id', function ($q) use ($activeSsQuarter) {
                    $q->select('id')
                        ->from('ss_lessons')
                        ->where('quarter_id', $activeSsQuarter->id);
                })
                ->where('status', 'published')
                ->count()
            : 0;

        $ssPublishedDaysWithoutContent = $activeSsQuarter
            ? SsDay::query()
                ->whereIn('lesson_id', function ($q) use ($activeSsQuarter) {
                    $q->select('id')
                        ->from('ss_lessons')
                        ->where('quarter_id', $activeSsQuarter->id);
                })
                ->where('status', 'published')
                ->whereRaw("TRIM(COALESCE(content, '')) = ''")
                ->count()
            : 0;

        $activeMemberPosts = MemberPost::query()
            ->whereNull('hidden_at')
            ->where(function ($q) use ($nowJkt) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', $nowJkt);
            })
            ->count();

        $archivedMemberPosts = MemberPost::query()
            ->whereNull('hidden_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $nowJkt)
            ->count();

        $savedVerseActionsCount = UserVerseAction::query()->count();
        $savedVerseNotesCount = UserVerseAction::query()
            ->whereRaw("TRIM(COALESCE(note_text, '')) <> ''")
            ->count();
        $userMetricsCount = UserMetric::query()->count();

        $markerTableReady = Schema::hasTable('data_lifecycle_markers');
        $legacyMarkerCount = 0;
        $legacyDroppedCount = 0;
        if ($markerTableReady) {
            $legacyMarkerCount = DB::table('data_lifecycle_markers')
                ->where('entity_type', 'table')
                ->whereIn('entity_key', ['quarters', 'lessons'])
                ->whereIn('status', ['deprecated', 'drop_ready'])
                ->count();

            $legacyDroppedCount = DB::table('data_lifecycle_markers')
                ->where('entity_type', 'table')
                ->whereIn('entity_key', ['quarters', 'lessons'])
                ->where('status', 'dropped')
                ->count();
        }

        $this->sections = [
            [
                'title' => 'Core Channels & Daily Verse',
                'checks' => [
                    $this->checkStatus(
                        'Required channels',
                        empty($missingCoreSlugs) ? 'ok' : 'danger',
                        empty($missingCoreSlugs)
                            ? 'Semua slug wajib tersedia.'
                            : 'Missing: ' . implode(', ', $missingCoreSlugs),
                    ),
                    $this->checkStatus(
                        'Weekly published posts',
                        $weeklyPublishedCount > 0 ? 'ok' : 'warn',
                        $weeklyPublishedCount . ' post published (weekly channels).',
                    ),
                    $this->checkStatus(
                        'Daily verse for today',
                        $dailyVerseTodayCount === 1 ? 'ok' : ($dailyVerseTodayCount > 1 ? 'warn' : 'danger'),
                        $dailyVerseTodayCount === 1
                            ? '1 post daily verse untuk hari ini.'
                            : 'Jumlah hari ini: ' . $dailyVerseTodayCount . ' (target: 1).',
                    ),
                ],
                'links' => [
                    ['label' => 'Manage Channels', 'url' => ChannelResource::getUrl()],
                    ['label' => 'Manage Weekly Posts', 'url' => PostResource::getUrl()],
                ],
            ],
            [
                'title' => 'Today Feed & Sabbath School',
                'checks' => [
                    $this->checkStatus(
                        'Sabbath School active quarter',
                        $activeSsQuarter ? 'ok' : 'danger',
                        $activeSsQuarter
                            ? 'Q' . $activeSsQuarter->quarter . ' ' . $activeSsQuarter->year . ' aktif.'
                            : 'Belum ada ss_quarters.is_active = true.',
                    ),
                    $this->checkStatus(
                        'Published SS days in active quarter',
                        $ssPublishedDaysInActiveQuarter > 0 ? 'ok' : 'warn',
                        $ssPublishedDaysInActiveQuarter . ' published day(s), '
                            . $ssLessonsInActiveQuarter . ' lesson(s).',
                    ),
                    $this->checkStatus(
                        'Published SS days without content',
                        $ssPublishedDaysWithoutContent === 0 ? 'ok' : 'warn',
                        $ssPublishedDaysWithoutContent . ' day(s) kosong.',
                    ),
                ],
                'links' => [
                    ['label' => 'SS Quarters', 'url' => SsQuarterResource::getUrl()],
                    ['label' => 'SS Lessons', 'url' => SsLessonResource::getUrl()],
                    ['label' => 'SS Days', 'url' => SsDayResource::getUrl()],
                ],
            ],
            [
                'title' => 'Community & Discussion',
                'checks' => [
                    $this->checkStatus(
                        'Active member posts',
                        $activeMemberPosts > 0 ? 'ok' : 'warn',
                        $activeMemberPosts . ' active post(s).',
                    ),
                    $this->checkStatus(
                        'Archived member posts',
                        'ok',
                        $archivedMemberPosts . ' archived post(s).',
                    ),
                    $this->checkStatus(
                        'Member post comments',
                        'ok',
                        MemberPostComment::query()->count() . ' comment(s).',
                    ),
                    $this->checkStatus(
                        'Sabbath School discussion comments',
                        'ok',
                        SsDayComment::query()->count() . ' comment(s).',
                    ),
                ],
                'links' => [
                    ['label' => 'Member Posts', 'url' => MemberPostResource::getUrl()],
                    ['label' => 'Member Comments', 'url' => MemberPostCommentResource::getUrl()],
                ],
            ],
            [
                'title' => 'VerseHub User Activity',
                'checks' => [
                    $this->checkStatus(
                        'Saved verse actions',
                        $savedVerseActionsCount > 0 ? 'ok' : 'warn',
                        $savedVerseActionsCount . ' action(s) tersimpan.',
                    ),
                    $this->checkStatus(
                        'Verse notes',
                        'ok',
                        $savedVerseNotesCount . ' note(s).',
                    ),
                    $this->checkStatus(
                        'User metrics rows',
                        $userMetricsCount > 0 ? 'ok' : 'warn',
                        $userMetricsCount . ' metric row(s).',
                    ),
                ],
                'links' => [
                    ['label' => 'Open VerseHub Reader', 'url' => url('/versehub/id')],
                    ['label' => 'Open My Spiritual Journey', 'url' => url('/versehub/id/my-spiritual-journey')],
                    ['label' => 'Open Today', 'url' => url('/today')],
                    ['label' => 'Open Community', 'url' => url('/community')],
                ],
            ],
            [
                'title' => 'Data Lifecycle',
                'checks' => [
                    $this->checkStatus(
                        'Lifecycle marker table',
                        $markerTableReady ? 'ok' : 'warn',
                        $markerTableReady
                            ? 'data_lifecycle_markers tersedia.'
                            : 'Belum ada marker table.',
                    ),
                    $this->checkStatus(
                        'Legacy tables marked deprecated',
                        ($legacyMarkerCount >= 2 || $legacyDroppedCount >= 2) ? 'ok' : 'warn',
                        $legacyDroppedCount >= 2
                            ? "{$legacyDroppedCount}/2 legacy table marker status dropped."
                            : "{$legacyMarkerCount}/2 marker aktif untuk quarters & lessons.",
                    ),
                ],
                'links' => [],
            ],
        ];
    }

    /**
     * @return array{label: string, status: string, detail: string}
     */
    private function checkStatus(string $label, string $status, string $detail): array
    {
        return [
            'label' => $label,
            'status' => $status,
            'detail' => $detail,
        ];
    }

    /**
     * @return array{created:int}
     */
    private function ensureCoreChannelsInternal(): array
    {
        $definitions = [
            'faith-journey' => ['title' => 'FaithJourney', 'type' => 'weekly'],
            'family' => ['title' => 'Family', 'type' => 'weekly'],
            'god-first' => ['title' => 'GodFirst', 'type' => 'weekly'],
            'versehub-daily' => ['title' => 'DailyVerse', 'type' => 'library'],
        ];

        $created = 0;
        foreach ($definitions as $slug => $attrs) {
            $channel = Channel::query()->firstOrCreate(
                ['slug' => $slug],
                [
                    'title' => $attrs['title'],
                    'description' => '',
                    'cover_image_url' => null,
                    'type' => $attrs['type'],
                ],
            );
            if ($channel->wasRecentlyCreated) {
                $created++;
            }
        }

        return ['created' => $created];
    }

    /**
     * @return array{created: bool, reference: string}
     */
    private function createTodayDailyVerseInternal(): array
    {
        $nowJkt = Carbon::now('Asia/Jakarta');
        $todayJkt = $nowJkt->toDateString();
        $publishAtAppTz = $nowJkt->copy()->setTime(6, 0)->timezone(config('app.timezone', 'UTC'));

        $existingToday = Post::query()
            ->whereHas('channel', fn ($q) => $q->where('slug', 'versehub-daily'))
            ->where('status', 'published')
            ->where('meta->kind', 'versehub_daily')
            ->whereDate('publish_at', $todayJkt)
            ->exists();

        if ($existingToday) {
            return [
                'created' => false,
                'reference' => '',
            ];
        }

        $channel = Channel::query()->firstOrCreate(
            ['slug' => 'versehub-daily'],
            [
                'title' => 'DailyVerse',
                'description' => '',
                'cover_image_url' => null,
                'type' => 'library',
            ],
        );

        $bookCode = 'mzm';
        $chapter = 119;
        $verse = 105;
        $reference = 'Mazmur 119:105';
        $quote = 'Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.';

        Post::query()->create([
            'channel_id' => $channel->id,
            'title' => sprintf('Daily Verse — %s %d:%d', Str::upper($bookCode), $chapter, $verse),
            'content' => null,
            'publish_at' => $publishAtAppTz,
            'status' => 'published',
            'published_at' => $publishAtAppTz,
            'meta' => [
                'kind' => 'versehub_daily',
                'book_code' => $bookCode,
                'chapter' => $chapter,
                'verse' => $verse,
                'quote' => $quote,
                'reference' => $reference,
                'cta_label' => 'Baca Alkitab',
                'cta_href' => "/versehub/id/{$bookCode}-{$chapter}-{$verse}",
            ],
        ]);

        return [
            'created' => true,
            'reference' => $reference,
        ];
    }

    /**
     * @return array{quarter: string}
     */
    private function ensureSabbathSeedInternal(): array
    {
        $nowJkt = Carbon::now('Asia/Jakarta');
        $quarterNumber = (int) floor(($nowJkt->month - 1) / 3) + 1;

        [$quarterStart, $quarterEnd] = $this->quarterDateRange($nowJkt->year, $quarterNumber);

        $quarter = SsQuarter::query()->firstOrCreate(
            ['year' => $nowJkt->year, 'quarter' => $quarterNumber],
            [
                'title' => "Q{$quarterNumber} {$nowJkt->year}",
                'start_date' => $quarterStart,
                'end_date' => $quarterEnd,
                'is_active' => true,
            ],
        );

        if (! $quarter->is_active) {
            SsQuarter::query()->whereKeyNot($quarter->id)->update(['is_active' => false]);
            $quarter->is_active = true;
            $quarter->save();
        }

        $lesson1Start = $quarter->start_date instanceof Carbon
            ? $quarter->start_date->copy()
            : Carbon::parse($quarter->start_date);

        $lesson = SsLesson::query()->firstOrCreate(
            ['quarter_id' => $quarter->id, 'lesson_number' => 1],
            [
                'title' => 'Lesson 1 (Preview)',
                'start_date' => $lesson1Start->toDateString(),
                'end_date' => $lesson1Start->copy()->addDays(6)->toDateString(),
            ],
        );

        $day = SsDay::query()->firstOrCreate(
            ['lesson_id' => $lesson->id, 'day_key' => 'sat'],
            [
                'date' => $lesson1Start->toDateString(),
                'title' => 'Sabtu',
                'content' => 'Konten minimal Sabbath School untuk memastikan halaman bisa dirender.',
                'status' => 'published',
            ],
        );

        if (($day->status ?? 'draft') !== 'published') {
            $day->status = 'published';
            if (trim((string) $day->content) === '') {
                $day->content = 'Konten minimal Sabbath School untuk memastikan halaman bisa dirender.';
            }
            $day->save();
        }

        return [
            'quarter' => "Q{$quarterNumber} {$nowJkt->year}",
        ];
    }

    private function logAction(string $action, array $details = []): void
    {
        if (! Schema::hasTable('admin_audit_logs')) {
            return;
        }

        AdminAuditLog::query()->create([
            'user_id' => Auth::id(),
            'action' => $action,
            'details' => $details,
        ]);
    }

    private function loadLogUsers(): void
    {
        if (! Schema::hasTable('admin_audit_logs')) {
            $this->logUsers = [];

            return;
        }

        $ids = AdminAuditLog::query()
            ->whereNotNull('user_id')
            ->select('user_id')
            ->distinct()
            ->pluck('user_id')
            ->map(fn ($v) => (int) $v)
            ->all();

        if (empty($ids)) {
            $this->logUsers = [];

            return;
        }

        $this->logUsers = User::query()
            ->whereIn('id', $ids)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'label' => trim((string) ($user->name ?: $user->email)),
            ])
            ->all();
    }

    private function loadRecentLogs(): void
    {
        if (! Schema::hasTable('admin_audit_logs')) {
            $this->recentLogs = [];

            return;
        }

        $this->recentLogs = $this->buildLogQuery()
            ->with('user:id,name,email')
            ->latest('id')
            ->limit(30)
            ->get()
            ->map(fn (AdminAuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'details' => $log->details ?? [],
                'user' => $log->user?->name ?? $log->user?->email ?? 'System',
                'created_at' => $log->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i:s'),
            ])
            ->all();
    }

    private function loadCriticalTopIssues(): void
    {
        if (! Schema::hasTable('admin_audit_logs')) {
            $this->criticalTopIssues = [];

            return;
        }

        $since = Carbon::now('Asia/Jakarta')
            ->subDays(7)
            ->timezone(config('app.timezone', 'UTC'));

        $logs = AdminAuditLog::query()
            ->where('action', 'fix_critical')
            ->where('created_at', '>=', $since)
            ->get(['id', 'details', 'created_at']);

        if ($logs->isEmpty()) {
            $this->criticalTopIssues = [];

            return;
        }

        /** @var array<string, array{issue:string,count:int,last_fixed_at:string,last_fixed_ts:int}> $bucket */
        $bucket = [];

        foreach ($logs as $log) {
            $items = is_array($log->details['fixed'] ?? null) ? $log->details['fixed'] : [];
            $fixedAt = (string) $log->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i');

            foreach ($items as $item) {
                $issue = trim((string) $item);
                if ($issue === '') {
                    continue;
                }

                if (! isset($bucket[$issue])) {
                    $bucket[$issue] = [
                        'issue' => $issue,
                        'count' => 0,
                        'last_fixed_at' => $fixedAt,
                        'last_fixed_ts' => (int) $log->created_at?->getTimestamp(),
                    ];
                }

                $bucket[$issue]['count']++;
                $bucket[$issue]['last_fixed_at'] = $fixedAt;
                $bucket[$issue]['last_fixed_ts'] = (int) $log->created_at?->getTimestamp();
            }
        }

        if (empty($bucket)) {
            $this->criticalTopIssues = [];

            return;
        }

        usort($bucket, function (array $a, array $b): int {
            if ($a['count'] === $b['count']) {
                return $b['last_fixed_ts'] <=> $a['last_fixed_ts'];
            }

            return $b['count'] <=> $a['count'];
        });

        $this->criticalTopIssues = array_map(
            fn (array $item) => [
                'issue' => $item['issue'],
                'count' => $item['count'],
                'last_fixed_at' => $item['last_fixed_at'],
            ],
            array_slice(array_values($bucket), 0, 3),
        );
    }

    private function loadRecommendedActions(): void
    {
        $actions = [];

        foreach ($this->criticalTopIssues as $issue) {
            $name = (string) ($issue['issue'] ?? '');
            $count = (int) ($issue['count'] ?? 0);

            if (Str::startsWith($name, 'daily_verse')) {
                $actions[] = [
                    'title' => 'Stabilkan Daily Verse Harian',
                    'description' => "Issue '{$name}' muncul {$count}x. Jalankan seed daily verse hari ini.",
                    'method' => 'createTodayDailyVerse',
                    'priority' => 'high',
                ];
                continue;
            }

            if (Str::startsWith($name, 'core_channels')) {
                $actions[] = [
                    'title' => 'Pastikan Core Channels Lengkap',
                    'description' => "Issue '{$name}' muncul {$count}x. Sinkronkan slug channel wajib.",
                    'method' => 'ensureCoreChannels',
                    'priority' => 'high',
                ];
                continue;
            }

            if (Str::startsWith($name, 'sabbath_seed')) {
                $actions[] = [
                    'title' => 'Perkuat Seed Sabbath School',
                    'description' => "Issue '{$name}' muncul {$count}x. Pastikan quarter aktif + lesson/day minimal.",
                    'method' => 'ensureSabbathSeed',
                    'priority' => 'high',
                ];
            }
        }

        if (empty($actions)) {
            $actions[] = [
                'title' => 'Tidak ada prioritas kritikal',
                'description' => 'Kondisi stabil. Lakukan refresh audit berkala untuk menjaga health tetap hijau.',
                'method' => 'refreshAudit',
                'priority' => 'normal',
            ];
        }

        // Deduplicate by method while keeping order.
        $seen = [];
        $this->recommendedActions = array_values(array_filter($actions, function (array $item) use (&$seen): bool {
            $method = $item['method'];
            if (isset($seen[$method])) {
                return false;
            }
            $seen[$method] = true;

            return true;
        }));
    }

    /**
     * @return array<string, array{label:string,description:string}>
     */
    private function actionMap(): array
    {
        return [
            'fixCritical' => [
                'label' => 'Fix Only Critical',
                'description' => 'Menjalankan perbaikan otomatis untuk item status CRITICAL saja.',
            ],
            'ensureCoreChannels' => [
                'label' => 'Ensure Core Channels',
                'description' => 'Mengecek dan membuat channel inti yang hilang.',
            ],
            'createTodayDailyVerse' => [
                'label' => 'Create Today Daily Verse',
                'description' => 'Membuat 1 post daily verse published untuk hari ini jika belum ada.',
            ],
            'ensureSabbathSeed' => [
                'label' => 'Ensure Sabbath Seed',
                'description' => 'Memastikan quarter aktif, lesson 1, dan day sat tersedia untuk Sabbath School.',
            ],
            'refreshAudit' => [
                'label' => 'Refresh Audit',
                'description' => 'Memuat ulang status audit terbaru.',
            ],
            'resetLogFilters' => [
                'label' => 'Reset Log Filters',
                'description' => 'Menghapus seluruh filter audit trail.',
            ],
            'exportAuditTrailCsv' => [
                'label' => 'Export Audit CSV',
                'description' => 'Mengunduh audit trail sesuai filter aktif saat ini.',
            ],
        ];
    }

    private function guardAdmin(string $attemptedAction): bool
    {
        $user = Auth::user();
        $isAdmin = (bool) ($user?->is_admin ?? false);

        if ($isAdmin) {
            return true;
        }

        Notification::make()
            ->title('Akses ditolak')
            ->body('Guardrail: hanya admin yang dapat menjalankan aksi ini.')
            ->danger()
            ->send();

        $this->logAction('guardrail_denied', [
            'attempted_action' => $attemptedAction,
            'user_id' => $user?->id,
            'email' => $user?->email,
        ]);

        return false;
    }

    private function actorLabel(): string
    {
        $user = Auth::user();
        if (! $user) {
            return 'system';
        }

        return trim((string) ($user->name ?: $user->email ?: ('user#'.$user->id)));
    }

    private function enforceActionCooldown(string $action, int $seconds): bool
    {
        $userId = (int) (Auth::id() ?? 0);
        if ($userId <= 0) {
            return false;
        }

        $key = "audit:cooldown:user:{$userId}:action:{$action}";
        $lockedUntil = (int) (Cache::get($key) ?? 0);
        $nowTs = now()->timestamp;

        if ($lockedUntil > $nowTs) {
            $remaining = max(1, $lockedUntil - $nowTs);
            Notification::make()
                ->title('Action cooldown aktif')
                ->body("Tunggu {$remaining} detik sebelum menjalankan aksi {$action} lagi.")
                ->warning()
                ->send();

            return false;
        }

        Cache::put($key, $nowTs + $seconds, now()->addSeconds($seconds));
        $this->actionCooldowns[$action] = $seconds;

        return true;
    }

    private function getCooldownRemaining(string $action): int
    {
        $userId = (int) (Auth::id() ?? 0);
        if ($userId <= 0) {
            return 0;
        }

        $key = "audit:cooldown:user:{$userId}:action:{$action}";
        $lockedUntil = (int) (Cache::get($key) ?? 0);
        $nowTs = now()->timestamp;

        if ($lockedUntil <= $nowTs) {
            return 0;
        }

        return max(1, $lockedUntil - $nowTs);
    }

    private function buildLogQuery()
    {
        $query = AdminAuditLog::query();

        $action = trim((string) ($this->logFilters['action'] ?? ''));
        if ($action !== '') {
            $query->where('action', 'like', '%' . $action . '%');
        }

        $userId = trim((string) ($this->logFilters['user_id'] ?? ''));
        if ($userId !== '' && ctype_digit($userId)) {
            $query->where('user_id', (int) $userId);
        }

        $dateFrom = trim((string) ($this->logFilters['date_from'] ?? ''));
        if ($dateFrom !== '') {
            try {
                $from = Carbon::parse($dateFrom, 'Asia/Jakarta')->startOfDay()->timezone(config('app.timezone', 'UTC'));
                $query->where('created_at', '>=', $from);
            } catch (\Throwable) {
                // ignore invalid input
            }
        }

        $dateTo = trim((string) ($this->logFilters['date_to'] ?? ''));
        if ($dateTo !== '') {
            try {
                $to = Carbon::parse($dateTo, 'Asia/Jakarta')->endOfDay()->timezone(config('app.timezone', 'UTC'));
                $query->where('created_at', '<=', $to);
            } catch (\Throwable) {
                // ignore invalid input
            }
        }

        return $query;
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function quarterDateRange(int $year, int $quarter): array
    {
        $startMonth = (($quarter - 1) * 3) + 1;
        $start = Carbon::create($year, $startMonth, 1, 0, 0, 0, 'Asia/Jakarta')->startOfDay();
        $end = $start->copy()->addMonths(3)->subDay()->endOfDay();

        return [$start, $end];
    }
}

