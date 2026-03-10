<?php

namespace App\Http\Controllers;

use App\Models\AdminAuditLog;
use App\Models\MemberPost;
use App\Models\MemberPostComment;
use App\Models\Post;
use App\Models\SsDay;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SettingsVisibilityController extends Controller
{
    public function index(): Response
    {
        $viewer = auth()->user();
        $isAdminViewer = (bool) ($viewer?->is_admin ?? false);
        $hasItColumn = Schema::hasColumn('users', 'is_it');
        $isItViewer = $hasItColumn ? (bool) ($viewer?->is_it ?? false) : false;
        $canViewDetail = $isItViewer;

        $now = now();
        $last24h = $now->copy()->subDay();
        $last7d = $now->copy()->subDays(7);

        $usersTotal = User::query()->count();
        $adminsTotal = User::query()->where('is_admin', true)->count();
        $itTotal = $hasItColumn ? User::query()->where('is_it', true)->count() : 0;

        $publishedPosts7d = Post::query()
            ->where('status', 'published')
            ->where('published_at', '>=', $last7d)
            ->count();

        $scheduledPosts = Post::query()
            ->where('status', 'scheduled')
            ->count();

        $overdueScheduled = Post::query()
            ->where('status', 'scheduled')
            ->where('publish_at', '<', $now)
            ->count();

        $memberPostsActive = MemberPost::query()
            ->whereNull('hidden_at')
            ->where(function ($q) use ($now) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', $now);
            })
            ->count();

        $comments24h = MemberPostComment::query()
            ->where('created_at', '>=', $last24h)
            ->count();

        $ssDaysTotal = SsDay::query()->count();
        $ssDaysPublished = SsDay::query()->where('status', 'published')->count();
        $ssCoveragePercent = $ssDaysTotal > 0
            ? (int) round(($ssDaysPublished / $ssDaysTotal) * 100)
            : 0;

        $failedJobs24h = 0;
        if (Schema::hasTable('failed_jobs')) {
            $failedJobs24h = (int) DB::table('failed_jobs')
                ->where('failed_at', '>=', $last24h)
                ->count();
        }

        $auditQuery = AdminAuditLog::query()->where('created_at', '>=', $last24h);

        $securitySignals = (int) (clone $auditQuery)
            ->where(function ($q) {
                $q->where('action', 'like', '%deny%')
                    ->orWhere('action', 'like', '%forbid%')
                    ->orWhere('action', 'like', '%mfa%')
                    ->orWhere('action', 'like', '%security%')
                    ->orWhere('action', 'like', '%critical%');
            })
            ->count();

        $moderationOps24h = (int) (clone $auditQuery)
            ->where(function ($q) {
                $q->where('action', 'like', '%hide%')
                    ->orWhere('action', 'like', '%unhide%')
                    ->orWhere('action', 'like', '%delete%')
                    ->orWhere('action', 'like', '%comment%');
            })
            ->count();

        $opsActions7d = AdminAuditLog::query()
            ->where('created_at', '>=', $last7d)
            ->count();

        $riskScore = min(
            100,
            ($failedJobs24h * 18)
                + ($securitySignals * 10)
                + ($overdueScheduled * 6)
                + (max(0, 70 - $ssCoveragePercent))
        );

        $riskLevel = match (true) {
            $riskScore >= 70 => 'Tinggi',
            $riskScore >= 35 => 'Menengah',
            default => 'Rendah',
        };

        $impactSummary = match (true) {
            $riskScore >= 70 => 'Jika tidak ditangani cepat, user bisa melihat error, konten terlambat tayang, dan kepercayaan menurun.',
            $riskScore >= 35 => 'Sistem masih aman, tapi ada potensi gangguan jadwal konten dan penurunan kenyamanan user.',
            default => 'Sistem dalam kondisi stabil. Risiko utama masih terkontrol dengan baik.',
        };

        $threats = [
            [
                'label' => 'Security Signals (24h)',
                'count' => $securitySignals,
                'severity' => $securitySignals >= 4 ? 'high' : ($securitySignals >= 1 ? 'medium' : 'low'),
                'impact' => 'Sinyal anomali akses/admin action sensitif.',
            ],
            [
                'label' => 'Failed Jobs (24h)',
                'count' => $failedJobs24h,
                'severity' => $failedJobs24h >= 3 ? 'high' : ($failedJobs24h >= 1 ? 'medium' : 'low'),
                'impact' => 'Potensi notifikasi/tugas backend tertunda.',
            ],
            [
                'label' => 'Scheduled Overdue',
                'count' => $overdueScheduled,
                'severity' => $overdueScheduled >= 3 ? 'high' : ($overdueScheduled >= 1 ? 'medium' : 'low'),
                'impact' => 'Konten yang seharusnya tayang belum terpublikasi.',
            ],
        ];

        $adminDrilldown = [
            [
                'label' => 'Channels',
                'href' => route('filament.admin.resources.channels.index'),
            ],
            [
                'label' => 'Posts',
                'href' => route('filament.admin.resources.posts.index'),
            ],
            [
                'label' => 'Sabbath Days',
                'href' => route('filament.admin.resources.ss-days.index'),
            ],
            [
                'label' => 'Member Posts',
                'href' => route('filament.admin.resources.member-posts.index'),
            ],
            [
                'label' => 'Member Comments',
                'href' => route('filament.admin.resources.member-post-comments.index'),
            ],
        ];

        if ($isItViewer) {
            $adminDrilldown = array_merge([
                [
                    'label' => 'Users',
                    'href' => route('filament.admin.resources.users.index'),
                ],
            ], $adminDrilldown, [
                [
                    'label' => 'Content Health Audit',
                    'href' => route('filament.admin.pages.content-health-audit'),
                ],
            ]);
        }

        $planAudit = $this->buildPlanAudit();
        $opsActions = $this->availableOpsActions($isAdminViewer);
        $recentExecutions = AdminAuditLog::query()
            ->where('action', 'like', 'ops.execute.%')
            ->latest()
            ->limit(8)
            ->get(['id', 'action', 'details', 'created_at'])
            ->map(function (AdminAuditLog $log): array {
                return [
                    'id' => $log->id,
                    'action' => (string) $log->action,
                    'details' => is_array($log->details) ? $log->details : [],
                    'createdAt' => optional($log->created_at)?->toISOString(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Settings/OpsVisibility', [
            'generatedAt' => Carbon::parse($now)->timezone('Asia/Jakarta')->toDateTimeString(),
            'viewer' => [
                'isAdmin' => $isAdminViewer,
                'isIt' => $isItViewer,
                'canDetail' => $canViewDetail,
                'canExecute' => $isAdminViewer,
                'mode' => $canViewDetail ? 'detail' : 'summary',
            ],
            'kpis' => [
                'usersTotal' => $usersTotal,
                'adminsTotal' => $adminsTotal,
                'itTotal' => $itTotal,
                'publishedPosts7d' => $publishedPosts7d,
                'scheduledPosts' => $scheduledPosts,
                'memberPostsActive' => $memberPostsActive,
                'comments24h' => $comments24h,
                'ssCoveragePercent' => $ssCoveragePercent,
                'opsActions7d' => $opsActions7d,
                'moderationOps24h' => $moderationOps24h,
            ],
            'risk' => [
                'score' => $riskScore,
                'level' => $riskLevel,
                'impactSummary' => $impactSummary,
            ],
            'threats' => $threats,
            'planAudit' => $planAudit,
            'opsActions' => $opsActions,
            'recentExecutions' => $isAdminViewer ? $recentExecutions : [],
            'lastExecution' => session('opsActionStatus'),
            'adminDrilldown' => $isAdminViewer ? $adminDrilldown : [],
        ]);
    }

    public function execute(Request $request): RedirectResponse
    {
        $viewer = $request->user();
        if (! (bool) ($viewer?->is_admin ?? false)) {
            return redirect()
                ->route('settings.ops-visibility')
                ->with('opsActionStatus', [
                    'action' => 'Execution blocked',
                    'status' => 'failed',
                    'exitCode' => 403,
                    'output' => 'Aksi ini hanya untuk role admin.',
                    'executedAt' => now()->timezone('Asia/Jakarta')->toDateTimeString(),
                ]);
        }

        $payload = $request->validate([
            'action' => ['required', 'string'],
        ]);

        $actionKey = (string) $payload['action'];
        $opsActions = collect($this->availableOpsActions(true))->keyBy('key');
        abort_unless($opsActions->has($actionKey), 422);

        $action = $opsActions->get($actionKey);
        $status = 'success';
        $output = '';
        $exitCode = 0;
        $errorMessage = null;

        try {
            $output = $this->executeAction($actionKey, $exitCode);

            if ($exitCode !== 0) {
                $status = 'failed';
            }
        } catch (Throwable $e) {
            $status = 'failed';
            $errorMessage = $e->getMessage();
        }

        AdminAuditLog::query()->create([
            'user_id' => $viewer?->id,
            'action' => 'ops.execute.' . $actionKey,
            'details' => [
                'label' => $action['label'] ?? $actionKey,
                'status' => $status,
                'exit_code' => $exitCode,
                'output' => Str::limit($output, 1400),
                'error' => $errorMessage,
            ],
        ]);

        return redirect()
            ->route('settings.ops-visibility')
            ->with('opsActionStatus', [
                'action' => $action['label'] ?? $actionKey,
                'status' => $status,
                'exitCode' => $exitCode,
                'output' => Str::limit($errorMessage ?: $output, 240),
                'executedAt' => now()->timezone('Asia/Jakarta')->toDateTimeString(),
            ]);
    }

    private function availableOpsActions(bool $isAdminViewer): array
    {
        $items = [
            [
                'key' => 'publish_due_posts',
                'label' => 'Publish Scheduled Posts',
                'description' => 'Jalankan publish konten yang sudah lewat jadwal.',
                'impact' => 'Konten terjadwal langsung dipublikasikan jika due.',
            ],
            [
                'key' => 'recalculate_user_metrics',
                'label' => 'Recalculate User Metrics',
                'description' => 'Hitung ulang metrik user untuk dashboard activity.',
                'impact' => 'Data insight user jadi up-to-date.',
            ],
            [
                'key' => 'optimize_clear',
                'label' => 'Clear Optimize Cache',
                'description' => 'Bersihkan cache config/route/view untuk troubleshooting.',
                'impact' => 'Menyegarkan cache aplikasi saat ada anomali.',
            ],
            [
                'key' => 'cleanup_expired_member_posts',
                'label' => 'Hide Expired Member Posts',
                'description' => 'Sembunyikan otomatis post komunitas yang sudah lewat masa aktif.',
                'impact' => 'Feed komunitas lebih bersih dari post kedaluwarsa.',
            ],
        ];

        return array_map(function (array $item) use ($isAdminViewer): array {
            $item['canRun'] = $isAdminViewer;
            return $item;
        }, $items);
    }

    private function buildPlanAudit(): array
    {
        $files = [
            base_path('RENCANA SELANJUTNYA.md'),
            base_path('FOCUS-CHAIN-LIST.md'),
            base_path('PROGRESS.md'),
        ];

        $documents = [];
        $allPending = [];

        foreach ($files as $path) {
            $documents[] = $doc = $this->auditMarkdownFile($path);
            foreach ($doc['pendingItems'] as $item) {
                if (count($allPending) >= 16) {
                    break;
                }
                $allPending[] = [
                    'document' => $doc['name'],
                    'text' => $item,
                ];
            }
        }

        return [
            'documents' => $documents,
            'nextActions' => $allPending,
        ];
    }

    private function auditMarkdownFile(string $path): array
    {
        $name = basename($path);
        $exists = is_file($path);

        if (! $exists) {
            return [
                'name' => $name,
                'path' => $path,
                'exists' => false,
                'heading' => null,
                'summary' => 'File tidak ditemukan.',
                'stats' => [
                    'total' => 0,
                    'completed' => 0,
                    'pending' => 0,
                ],
                'pendingItems' => [],
            ];
        }

        $raw = (string) file_get_contents($path);
        $lines = preg_split('/\r\n|\r|\n/', $raw) ?: [];
        $heading = null;
        $summary = null;
        $completed = 0;
        $pending = 0;
        $pendingItems = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($heading === null && preg_match('/^#{1,6}\s+(.+)$/', $trimmed, $m)) {
                $heading = trim((string) $m[1]);
            }

            if ($summary === null && $trimmed !== '' && !Str::startsWith($trimmed, ['#', '- [', '<!--'])) {
                $summary = Str::limit($trimmed, 180);
            }

            if (preg_match('/^\s*-\s*\[([ xX])\]\s*(.+)\s*$/', $line, $m)) {
                $isDone = strtolower((string) $m[1]) === 'x';
                $taskText = trim((string) $m[2]);

                if ($isDone) {
                    $completed++;
                } else {
                    $pending++;
                    if (count($pendingItems) < 8) {
                        $pendingItems[] = $taskText;
                    }
                }
            }
        }

        return [
            'name' => $name,
            'path' => $path,
            'exists' => true,
            'heading' => $heading,
            'summary' => $summary ?: 'Tidak ada ringkasan teks.',
            'stats' => [
                'total' => $completed + $pending,
                'completed' => $completed,
                'pending' => $pending,
            ],
            'pendingItems' => $pendingItems,
        ];
    }

    private function executeAction(string $actionKey, int &$exitCode): string
    {
        return match ($actionKey) {
            'publish_due_posts' => $this->runArtisan('app:publish-due-posts', $exitCode),
            'recalculate_user_metrics' => $this->runArtisan('app:recalculate-user-metrics', $exitCode),
            'optimize_clear' => $this->runArtisan('optimize:clear', $exitCode),
            'cleanup_expired_member_posts' => $this->cleanupExpiredMemberPosts($exitCode),
            default => $this->unknownAction($exitCode),
        };
    }

    private function runArtisan(string $command, int &$exitCode): string
    {
        $exitCode = Artisan::call($command);

        return trim((string) Artisan::output());
    }

    private function cleanupExpiredMemberPosts(int &$exitCode): string
    {
        $affected = MemberPost::query()
            ->whereNull('hidden_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update([
                'hidden_at' => now(),
                'hidden_by' => auth()->id(),
                'updated_at' => now(),
            ]);

        $exitCode = 0;

        return "Hidden {$affected} expired member post(s).";
    }

    private function unknownAction(int &$exitCode): string
    {
        $exitCode = 1;

        return 'Unknown action.';
    }
}
