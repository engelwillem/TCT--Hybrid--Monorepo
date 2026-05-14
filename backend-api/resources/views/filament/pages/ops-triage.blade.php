<x-filament-panels::page>
    @php
        $overduePostsUrl = route('filament.admin.resources.posts.index', [
            'tableFilters' => [
                'overdue_scheduled' => ['isActive' => 1],
            ],
        ]);

        $ssNeedsPublishUrl = route('filament.admin.resources.ss-days.index', [
            'tableFilters' => [
                'needs_publish' => ['isActive' => 1],
            ],
        ]);

        $contentHealthUrl = route('filament.admin.pages.content-health-audit');
    @endphp

    <script>
        // UX helper:
        // When deep-linked with a hash (e.g. #scheduled-overdue), ensure the section
        // is scrolled into view and briefly highlighted.
        document.addEventListener('DOMContentLoaded', function () {
            var hash = String(window.location.hash || '');
            if (!hash || hash.length < 2) return;

            var id = hash.substring(1);
            var el = document.getElementById(id);
            if (!el) return;

            window.setTimeout(function () {
                try {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } catch (e) {
                    el.scrollIntoView();
                }

                // Temporary highlight
                el.classList.add('ring-2', 'ring-amber-300', 'ring-offset-2', 'ring-offset-gray-50');
                window.setTimeout(function () {
                    el.classList.remove('ring-2', 'ring-amber-300', 'ring-offset-2', 'ring-offset-gray-50');
                }, 1600);
            }, 80);
        });
    </script>

    <div class="space-y-6">
        <div class="rounded-xl border border-gray-200 bg-white p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg font-semibold">Ops Triage</h2>
                    <p class="text-sm text-gray-600">Shortcut cepat dari aplikasi → langsung ke menu aksi prioritas.</p>
                </div>
                <div class="text-xs text-gray-500">Updated: {{ $generatedAt }}</div>
            </div>
        </div>

        <div id="scheduled-overdue" class="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 transition">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h3 class="text-base font-semibold">Scheduled Posts Overdue</h3>
                    <p class="text-sm text-gray-600">Post terjadwal yang publish_at sudah lewat.</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold">{{ $overdueScheduledCount }}</div>
                    <div class="text-xs text-gray-500">item</div>
                </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                <x-filament::button tag="a" href="{{ $overduePostsUrl }}" color="primary">
                    Open list (filtered)
                </x-filament::button>
                <x-filament::button tag="a" href="{{ route('filament.admin.pages.bulk-schedule-posts') }}" color="gray">
                    Bulk Scheduler
                </x-filament::button>
            </div>
        </div>

        <div id="ss-needs-publish" class="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 transition">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h3 class="text-base font-semibold">Sabbath School Draft Days</h3>
                    <p class="text-sm text-gray-600">Hari SS yang masih draft (belum publish).</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold">{{ $ssDraftDays }}</div>
                    <div class="text-xs text-gray-500">draft</div>
                </div>
            </div>
            <div class="mt-4">
                <x-filament::button tag="a" href="{{ $ssNeedsPublishUrl }}" color="primary">
                    Open SS Days (needs publish)
                </x-filament::button>
            </div>
        </div>

        <div id="backend-queue" class="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 transition">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h3 class="text-base font-semibold">Backend Queue / Failed Jobs (24h)</h3>
                    <p class="text-sm text-gray-600">Indikator proses backend yang gagal (butuh IT untuk detail).</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold">{{ $failedJobs24h }}</div>
                    <div class="text-xs text-gray-500">failed</div>
                </div>
            </div>

            @if(auth()->user()?->is_it)
                <div class="mt-4">
                    <x-filament::button tag="a" href="{{ $contentHealthUrl }}" color="primary">
                        Open Content Health Audit (IT)
                    </x-filament::button>
                </div>
            @else
                <div class="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    Akun Anda bukan role IT. Jika angka failed tinggi, hubungi IT untuk investigasi.
                </div>
            @endif
        </div>

        <div id="security" class="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 transition">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <h3 class="text-base font-semibold">Security Signals (24h)</h3>
                    <p class="text-sm text-gray-600">Ringkasan event deny/forbid/mfa/security/critical.</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold">{{ $securitySignals24h }}</div>
                    <div class="text-xs text-gray-500">events</div>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
