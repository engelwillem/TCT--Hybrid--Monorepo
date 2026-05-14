<x-filament-panels::page>
    <div class="mx-auto max-w-7xl space-y-5" wire:poll.1s="refreshCooldownState">
        @php
            $cdFix = (int) ($this->actionCooldowns['fixCritical'] ?? 0);
            $cdCore = (int) ($this->actionCooldowns['ensureCoreChannels'] ?? 0);
            $cdDaily = (int) ($this->actionCooldowns['createTodayDailyVerse'] ?? 0);
            $cdSs = (int) ($this->actionCooldowns['ensureSabbathSeed'] ?? 0);
            $cdExport = (int) ($this->actionCooldowns['exportAuditTrailCsv'] ?? 0);
            $hintFix = $cdFix > 0 ? "Cooldown aktif. Tunggu {$cdFix} detik sebelum menjalankan Fix Only Critical lagi." : 'Jalankan auto-fix untuk item CRITICAL.';
            $hintCore = $cdCore > 0 ? "Cooldown aktif. Tunggu {$cdCore} detik sebelum memastikan core channels lagi." : 'Cek dan buat core channels yang belum ada.';
            $hintDaily = $cdDaily > 0 ? "Cooldown aktif. Tunggu {$cdDaily} detik sebelum membuat daily verse lagi." : 'Buat Daily Verse hari ini jika belum ada.';
            $hintSs = $cdSs > 0 ? "Cooldown aktif. Tunggu {$cdSs} detik sebelum seed Sabbath School lagi." : 'Pastikan seed minimal Sabbath School tersedia.';
            $hintExport = $cdExport > 0 ? "Cooldown aktif. Tunggu {$cdExport} detik sebelum export CSV lagi." : 'Export audit trail ke CSV sesuai filter aktif.';
            $hasAnyCooldown = ($cdFix + $cdCore + $cdDaily + $cdSs + $cdExport) > 0;
            $cooldownItems = array_values(array_filter([
                $cdFix > 0 ? ['label' => 'Fix Only Critical', 'seconds' => $cdFix] : null,
                $cdCore > 0 ? ['label' => 'Ensure Core Channels', 'seconds' => $cdCore] : null,
                $cdDaily > 0 ? ['label' => 'Create Today Daily Verse', 'seconds' => $cdDaily] : null,
                $cdSs > 0 ? ['label' => 'Ensure Sabbath Seed', 'seconds' => $cdSs] : null,
                $cdExport > 0 ? ['label' => 'Export CSV', 'seconds' => $cdExport] : null,
            ]));
            $totalChecks = collect($this->sections)->sum(fn ($section) => count($section['checks'] ?? []));
            $criticalChecks = collect($this->sections)->sum(fn ($section) => collect($section['checks'] ?? [])->where('status', 'critical')->count());
            $warnChecks = collect($this->sections)->sum(fn ($section) => collect($section['checks'] ?? [])->where('status', 'warn')->count());
            $okChecks = collect($this->sections)->sum(fn ($section) => collect($section['checks'] ?? [])->where('status', 'ok')->count());
        @endphp

        <div class="sticky top-3 z-20 rounded-2xl border border-gray-800 bg-gray-950/95 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-white">Content Health Audit</h2>
                    <p class="text-sm text-gray-300">
                        Snapshot terakhir: {{ $this->generatedAt }}
                    </p>
                </div>
                <x-filament::button wire:click="refreshAudit" icon="heroicon-o-arrow-path">
                    Refresh Audit
                </x-filament::button>
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
                    <p class="text-[11px] uppercase tracking-wide text-gray-400">Total Check</p>
                    <p class="text-lg font-semibold text-gray-100">{{ $totalChecks }}</p>
                </div>
                <div class="rounded-lg border border-rose-900 bg-rose-950/30 px-3 py-2">
                    <p class="text-[11px] uppercase tracking-wide text-rose-300">Critical</p>
                    <p class="text-lg font-semibold text-rose-200">{{ $criticalChecks }}</p>
                </div>
                <div class="rounded-lg border border-amber-900 bg-amber-950/30 px-3 py-2">
                    <p class="text-[11px] uppercase tracking-wide text-amber-300">Warning</p>
                    <p class="text-lg font-semibold text-amber-200">{{ $warnChecks }}</p>
                </div>
                <div class="rounded-lg border border-emerald-900 bg-emerald-950/30 px-3 py-2">
                    <p class="text-[11px] uppercase tracking-wide text-emerald-300">OK</p>
                    <p class="text-lg font-semibold text-emerald-200">{{ $okChecks }}</p>
                </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
                <x-filament::button color="danger" size="sm" wire:click="requestActionConfirm('fixCritical')" icon="heroicon-o-wrench-screwdriver" :disabled="$cdFix > 0" :title="$hintFix">
                    {{ $cdFix > 0 ? "⌛ Fix Only Critical ({$cdFix}s)" : 'Fix Only Critical' }}
                </x-filament::button>
                <x-filament::button color="gray" size="sm" wire:click="requestActionConfirm('ensureCoreChannels')" icon="heroicon-o-cube" :disabled="$cdCore > 0" :title="$hintCore">
                    {{ $cdCore > 0 ? "⌛ Ensure Core Channels ({$cdCore}s)" : 'Ensure Core Channels' }}
                </x-filament::button>
                <x-filament::button color="gray" size="sm" wire:click="requestActionConfirm('createTodayDailyVerse')" icon="heroicon-o-book-open" :disabled="$cdDaily > 0" :title="$hintDaily">
                    {{ $cdDaily > 0 ? "⌛ Create Today Daily Verse ({$cdDaily}s)" : 'Create Today Daily Verse' }}
                </x-filament::button>
                <x-filament::button color="gray" size="sm" wire:click="requestActionConfirm('ensureSabbathSeed')" icon="heroicon-o-academic-cap" :disabled="$cdSs > 0" :title="$hintSs">
                    {{ $cdSs > 0 ? "⌛ Ensure Sabbath Seed ({$cdSs}s)" : 'Ensure Sabbath Seed' }}
                </x-filament::button>
            </div>
            @if($hasAnyCooldown)
                <div class="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                    <p class="text-xs font-medium text-amber-800 dark:text-amber-300">
                        Cooldown aktif untuk:
                    </p>
                    <div class="mt-1 flex flex-wrap gap-2">
                        @foreach($cooldownItems as $item)
                            <span class="inline-flex items-center rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800">
                                {{ $item['label'] }} · {{ $item['seconds'] }}s
                            </span>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        @if($this->pendingConfirmAction)
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-200">Konfirmasi Aksi Admin</h3>
                <p class="mt-1 text-sm text-amber-800 dark:text-amber-300">
                    <span class="font-semibold">{{ $this->pendingConfirmLabel }}</span>:
                    {{ $this->pendingConfirmDescription }}
                </p>
                <p class="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Action ini akan dicatat ke audit trail dengan actor aktif.
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                    <x-filament::button color="danger" size="sm" wire:click="confirmAction">
                        Ya, Jalankan
                    </x-filament::button>
                    <x-filament::button color="gray" size="sm" wire:click="cancelActionConfirm">
                        Batal
                    </x-filament::button>
                </div>
            </div>
        @endif

        <div class="grid gap-5 lg:grid-cols-2">
        <div class="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <h3 class="text-sm font-semibold text-white">Top Repeated Critical Issues (Last 7 Days)</h3>
            <p class="mt-1 text-xs text-gray-300">
                Berdasarkan aksi <code>fix_critical</code> di audit trail.
            </p>

            <div class="mt-3 space-y-2">
                @forelse($this->criticalTopIssues as $idx => $issue)
                    <div class="rounded-lg border border-gray-800 bg-gray-900/70 p-3">
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-sm font-medium text-gray-100">
                                #{{ $idx + 1 }} {{ $issue['issue'] }}
                            </p>
                            <span class="inline-flex items-center rounded-full bg-rose-950/30 px-2 py-0.5 text-xs font-semibold text-rose-300 ring-1 ring-rose-800">
                                {{ $issue['count'] }}x
                            </span>
                        </div>
                        <p class="mt-1 text-xs text-gray-400">
                            Last fixed: {{ $issue['last_fixed_at'] }} WIB
                        </p>
                    </div>
                @empty
                    <div class="rounded-lg border border-dashed border-gray-700 p-3 text-xs text-gray-300">
                        Belum ada pola critical yang terdeteksi dalam 7 hari terakhir.
                    </div>
                @endforelse
            </div>
        </div>

        <div class="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <h3 class="text-sm font-semibold text-white">Recommended Next Action</h3>
            <p class="mt-1 text-xs text-gray-300">
                Rekomendasi otomatis berdasarkan pola issue kritikal terbaru.
            </p>

            <div class="mt-3 space-y-2">
                @foreach($this->recommendedActions as $action)
                    <div class="rounded-lg border border-gray-800 bg-gray-900/70 p-3">
                        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-100">{{ $action['title'] }}</p>
                                <p class="mt-1 text-xs text-gray-300">{{ $action['description'] }}</p>
                            </div>
                            <div>
                                @if($action['method'] === 'createTodayDailyVerse')
                                    @php $cd = (int) ($this->actionCooldowns['createTodayDailyVerse'] ?? 0); @endphp
                                    <x-filament::button size="sm" color="danger" wire:click="requestActionConfirm('createTodayDailyVerse')" :disabled="$cd > 0" :title="$hintDaily">
                                        {{ $cd > 0 ? "⌛ Run Action ({$cd}s)" : 'Run Action' }}
                                    </x-filament::button>
                                @elseif($action['method'] === 'ensureCoreChannels')
                                    @php $cd = (int) ($this->actionCooldowns['ensureCoreChannels'] ?? 0); @endphp
                                    <x-filament::button size="sm" color="danger" wire:click="requestActionConfirm('ensureCoreChannels')" :disabled="$cd > 0" :title="$hintCore">
                                        {{ $cd > 0 ? "⌛ Run Action ({$cd}s)" : 'Run Action' }}
                                    </x-filament::button>
                                @elseif($action['method'] === 'ensureSabbathSeed')
                                    @php $cd = (int) ($this->actionCooldowns['ensureSabbathSeed'] ?? 0); @endphp
                                    <x-filament::button size="sm" color="danger" wire:click="requestActionConfirm('ensureSabbathSeed')" :disabled="$cd > 0" :title="$hintSs">
                                        {{ $cd > 0 ? "⌛ Run Action ({$cd}s)" : 'Run Action' }}
                                    </x-filament::button>
                                @else
                                    <x-filament::button size="sm" color="gray" wire:click="requestActionConfirm('refreshAudit')">
                                        Refresh
                                    </x-filament::button>
                                @endif
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
        </div>

        <div class="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 class="text-sm font-semibold text-white">Audit Trail</h3>
                <div class="flex flex-wrap gap-2">
                    <x-filament::button color="gray" size="sm" wire:click="requestActionConfirm('resetLogFilters')" icon="heroicon-o-x-mark">
                        Reset Filter
                    </x-filament::button>
                    <x-filament::button color="gray" size="sm" wire:click="requestActionConfirm('exportAuditTrailCsv')" icon="heroicon-o-arrow-down-tray" :disabled="$cdExport > 0" :title="$hintExport">
                        {{ $cdExport > 0 ? "⌛ Export CSV ({$cdExport}s)" : 'Export CSV' }}
                    </x-filament::button>
                </div>
            </div>
            <p class="mt-1 text-xs text-gray-300">
                Menyimpan aksi quick-fix yang dijalankan dari halaman ini.
            </p>

            <div class="mt-3 grid gap-2 md:grid-cols-4">
                <input
                    type="text"
                    wire:model.live.debounce.300ms="logFilters.action"
                    placeholder="Filter action (contoh: fix_critical)"
                    class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-100 focus:border-gray-500 focus:outline-none"
                />

                <select
                    wire:model.live="logFilters.user_id"
                    class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-100 focus:border-gray-500 focus:outline-none"
                >
                    <option value="">Semua Admin</option>
                    @foreach($this->logUsers as $userOpt)
                        <option value="{{ $userOpt['id'] }}">{{ $userOpt['label'] }}</option>
                    @endforeach
                </select>

                <input
                    type="date"
                    wire:model.live="logFilters.date_from"
                    class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-100 focus:border-gray-500 focus:outline-none"
                />

                <input
                    type="date"
                    wire:model.live="logFilters.date_to"
                    class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-100 focus:border-gray-500 focus:outline-none"
                />
            </div>

            <div class="mt-3 space-y-2">
                @forelse($this->recentLogs as $log)
                    <div class="rounded-lg border border-gray-800 bg-gray-900/70 p-3 text-xs">
                        <div class="flex items-start justify-between gap-3">
                            <p class="font-mono font-semibold text-gray-100">{{ $log['action'] }}</p>
                            <span class="text-gray-400">{{ $log['created_at'] }}</span>
                        </div>
                        <p class="mt-1 text-gray-300">By: {{ $log['user'] }}</p>
                        @if(!empty($log['details']))
                            <pre class="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-gray-950 p-2 text-[11px] text-gray-200">{{ json_encode($log['details'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) }}</pre>
                        @endif
                    </div>
                @empty
                    <div class="rounded-lg border border-dashed border-gray-700 p-3 text-xs text-gray-300">
                        Belum ada log. Jalankan quick-fix untuk mulai mencatat audit trail.
                    </div>
                @endforelse
            </div>
        </div>

        @foreach($this->sections as $section)
            <div class="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                <div class="flex items-center justify-between gap-3">
                    <h3 class="text-sm font-semibold text-white">{{ $section['title'] }}</h3>
                    @if(!empty($section['links']))
                        <div class="hidden flex-wrap gap-2 md:flex">
                            @foreach($section['links'] as $link)
                                <x-filament::button
                                    color="gray"
                                    size="sm"
                                    tag="a"
                                    :href="$link['url']"
                                    target="_blank"
                                >
                                    {{ $link['label'] }}
                                </x-filament::button>
                            @endforeach
                        </div>
                    @endif
                </div>

                <div class="mt-3 overflow-x-auto rounded-lg border border-gray-800 bg-gray-900/50">
                    <table class="min-w-full divide-y divide-gray-800">
                        <thead class="bg-gray-900">
                            <tr>
                                <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Check</th>
                                <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Detail</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800">
                            @foreach($section['checks'] as $check)
                                @php
                                    $statusClass = match($check['status']) {
                                        'ok' => 'bg-emerald-950/30 text-emerald-300 ring-emerald-800',
                                        'warn' => 'bg-amber-950/30 text-amber-300 ring-amber-800',
                                        default => 'bg-rose-950/30 text-rose-300 ring-rose-800',
                                    };
                                    $statusLabel = match($check['status']) {
                                        'ok' => 'OK',
                                        'warn' => 'WARN',
                                        default => 'CRITICAL',
                                    };
                                @endphp
                                <tr class="align-top">
                                    <td class="px-3 py-2 text-sm font-medium text-gray-100">{{ $check['label'] }}</td>
                                    <td class="px-3 py-2">
                                        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 {{ $statusClass }}">
                                            {{ $statusLabel }}
                                        </span>
                                    </td>
                                    <td class="px-3 py-2 text-xs text-gray-300">{{ $check['detail'] }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                @if(!empty($section['links']))
                    <div class="mt-3 flex flex-wrap gap-2 md:hidden">
                        @foreach($section['links'] as $link)
                            <x-filament::button
                                color="gray"
                                size="sm"
                                tag="a"
                                :href="$link['url']"
                                target="_blank"
                            >
                                {{ $link['label'] }}
                            </x-filament::button>
                        @endforeach
                    </div>
                @endif
            </div>
        @endforeach
    </div>
</x-filament-panels::page>

