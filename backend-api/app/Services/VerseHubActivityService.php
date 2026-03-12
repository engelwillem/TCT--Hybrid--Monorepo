<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;

class VerseHubActivityService
{
    /**
     * @param array<int, array<string, mixed>> $rows
     * @return array<int, array{label: string, items: array<int, array<string,mixed>>}>
     */
    public function groupByTimeline(array $rows, ?Carbon $now = null): array
    {
        $now = ($now ?: now())->copy()->timezone('Asia/Jakarta');

        /** @var Collection<int, array<string,mixed>> $collection */
        $collection = collect($rows);

        return $collection
            ->groupBy(function (array $row) use ($now): string {
                $raw = (string) ($row['updated_at'] ?? '');
                if ($raw === '') {
                    return 'Tanpa tanggal';
                }

                try {
                    $dt = Carbon::parse($raw)->timezone('Asia/Jakarta');
                } catch (\Throwable) {
                    return 'Tanpa tanggal';
                }

                if ($dt->isToday()) {
                    return 'Hari Ini';
                }
                if ($dt->isYesterday()) {
                    return 'Kemarin';
                }
                if ($dt->greaterThanOrEqualTo($now->copy()->startOfWeek())) {
                    return 'Minggu Ini';
                }
                if ($dt->isSameMonth($now)) {
                    return 'Bulan Ini';
                }
                if ($dt->isSameMonth($now->copy()->subMonth())) {
                    return 'Bulan Lalu';
                }

                return $dt->translatedFormat('F Y');
            })
            ->map(fn (Collection $items, string $label): array => [
                'label' => $label,
                'items' => $items->values()->all(),
            ])
            ->values()
            ->all();
    }
}
