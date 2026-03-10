<?php

namespace App\Filament\Pages;

use App\Models\AdminAuditLog;
use App\Models\Post;
use App\Models\SsDay;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Pages\Page;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use UnitEnum;

class OpsTriage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-bolt';

    protected static string|UnitEnum|null $navigationGroup = 'Operations';

    protected static ?string $navigationLabel = 'Ops Triage';

    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.ops-triage';

    public string $generatedAt = '';

    public int $overdueScheduledCount = 0;

    public int $failedJobs24h = 0;

    public int $ssDraftDays = 0;

    public int $securitySignals24h = 0;

    public static function shouldRegisterNavigation(): bool
    {
        // Keep this page available for deep-links from the app UI
        // without cluttering the left navigation.
        return false;
    }

    public static function canAccess(): bool
    {
        $user = Filament::auth()->user();

        return (bool) ($user?->is_admin ?? false);
    }

    public function mount(): void
    {
        abort_unless(static::canAccess(), 403);

        $this->refreshData();
    }

    public function refreshData(): void
    {
        $now = now();
        $last24h = $now->copy()->subDay();

        $this->generatedAt = Carbon::now('Asia/Jakarta')->translatedFormat('d M Y H:i') . ' WIB';

        $this->overdueScheduledCount = (int) Post::query()
            ->where('status', 'scheduled')
            ->whereNotNull('publish_at')
            ->where('publish_at', '<', $now)
            ->count();

        $this->failedJobs24h = 0;
        if (Schema::hasTable('failed_jobs')) {
            $this->failedJobs24h = (int) DB::table('failed_jobs')
                ->where('failed_at', '>=', $last24h)
                ->count();
        }

        $this->ssDraftDays = (int) SsDay::query()->where('status', 'draft')->count();

        $this->securitySignals24h = (int) AdminAuditLog::query()
            ->where('created_at', '>=', $last24h)
            ->where(function ($q) {
                $q->where('action', 'like', '%deny%')
                    ->orWhere('action', 'like', '%forbid%')
                    ->orWhere('action', 'like', '%mfa%')
                    ->orWhere('action', 'like', '%security%')
                    ->orWhere('action', 'like', '%critical%');
            })
            ->count();
    }
}
