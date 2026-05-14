<x-filament-panels::page>
    <div class="space-y-6">
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <form wire:submit.prevent="refreshData" class="grid gap-3 md:grid-cols-4">
                <label class="text-sm">
                    <span class="mb-1 block font-medium text-gray-700">Window (hari)</span>
                    <input type="number" min="1" max="60" wire:model.defer="days" class="w-full rounded-lg border-gray-300 text-sm" />
                </label>
                <label class="text-sm">
                    <span class="mb-1 block font-medium text-gray-700">Lang</span>
                    <select wire:model.defer="lang" class="w-full rounded-lg border-gray-300 text-sm">
                        <option value="id">id</option>
                        <option value="en">en</option>
                        <option value="all">all</option>
                    </select>
                </label>
                <div class="md:col-span-2 flex items-end">
                    <x-filament::button type="submit">
                        Refresh KPI
                    </x-filament::button>
                </div>
            </form>
        </div>

        <div class="grid gap-3 md:grid-cols-4">
            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Events Total</p>
                <p class="mt-2 text-2xl font-semibold text-gray-900">{{ $summary['events_total'] ?? 0 }}</p>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Sessions Viewed</p>
                <p class="mt-2 text-2xl font-semibold text-gray-900">{{ $summary['sessions_viewed'] ?? 0 }}</p>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Sessions with Action</p>
                <p class="mt-2 text-2xl font-semibold text-gray-900">{{ $summary['sessions_with_action'] ?? 0 }}</p>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Global CTR Any Action</p>
                <p class="mt-2 text-2xl font-semibold text-gray-900">{{ $summary['global_ctr_any'] ?? '0.00%' }}</p>
            </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-3 py-2 text-left">Persona</th>
                        <th class="px-3 py-2 text-left">Variant</th>
                        <th class="px-3 py-2 text-right">Viewed</th>
                        <th class="px-3 py-2 text-right">CTR Any</th>
                        <th class="px-3 py-2 text-right">CTR Start</th>
                        <th class="px-3 py-2 text-right">CTR Continue</th>
                        <th class="px-3 py-2 text-right">CTR Explore</th>
                        <th class="px-3 py-2 text-right">CTR Path</th>
                        <th class="px-3 py-2 text-right">CTR Search</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-gray-700">
                    @forelse($rows as $row)
                        <tr>
                            <td class="px-3 py-2 font-medium">{{ $row['persona'] }}</td>
                            <td class="px-3 py-2">{{ $row['variant'] }}</td>
                            <td class="px-3 py-2 text-right">{{ $row['viewed'] }}</td>
                            <td class="px-3 py-2 text-right">{{ $row['ctr_any'] }}%</td>
                            <td class="px-3 py-2 text-right">{{ $row['ctr_start'] }}%</td>
                            <td class="px-3 py-2 text-right">{{ $row['ctr_continue'] }}%</td>
                            <td class="px-3 py-2 text-right">{{ $row['ctr_explore'] }}%</td>
                            <td class="px-3 py-2 text-right">{{ $row['ctr_path'] }}%</td>
                            <td class="px-3 py-2 text-right">{{ $row['ctr_search'] }}%</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="px-3 py-6 text-center text-sm text-gray-500">
                                Belum ada data KPI untuk filter ini.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-filament-panels::page>

