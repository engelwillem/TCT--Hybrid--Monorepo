<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Models\SsDay;
use App\Support\RichContentSanitizer;
use Illuminate\Console\Command;

class SanitizeRichContentCommand extends Command
{
    protected $signature = 'app:sanitize-rich-content
        {--dry-run : Audit only, do not write sanitized HTML back to the database}
        {--sample=5 : Number of changed row IDs to show per surface in the summary}';

    protected $description = 'Normalize legacy rich HTML content for posts and Sabbath School days using the current sanitization contract.';

    public function handle(RichContentSanitizer $sanitizer): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $sampleLimit = max(0, (int) $this->option('sample'));

        $this->info($dryRun ? 'Rich content sanitization audit (dry-run)' : 'Rich content sanitization backfill');
        $this->newLine();

        $postStats = $this->sanitizeModelContent(
            modelLabel: 'posts',
            query: Post::query()->select(['id', 'content']),
            sanitizer: $sanitizer,
            dryRun: $dryRun,
            sampleLimit: $sampleLimit,
        );

        $ssDayStats = $this->sanitizeModelContent(
            modelLabel: 'ss_days',
            query: SsDay::query()->select(['id', 'content']),
            sanitizer: $sanitizer,
            dryRun: $dryRun,
            sampleLimit: $sampleLimit,
        );

        $this->table(
            ['Surface', 'Scanned', 'Would Change', 'Updated', 'Sample IDs'],
            [
                ['posts', $postStats['scanned'], $postStats['changed'], $postStats['updated'], $this->formatSampleIds($postStats['sampleIds'])],
                ['ss_days', $ssDayStats['scanned'], $ssDayStats['changed'], $ssDayStats['updated'], $this->formatSampleIds($ssDayStats['sampleIds'])],
            ],
        );

        if ($dryRun) {
            $this->comment('Dry-run only. No database rows were modified.');
        } else {
            $this->info('Legacy rich content normalization complete.');
        }

        return self::SUCCESS;
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<\Illuminate\Database\Eloquent\Model>  $query
     * @return array{scanned:int,changed:int,updated:int,sampleIds:list<int>}
     */
    private function sanitizeModelContent(string $modelLabel, $query, RichContentSanitizer $sanitizer, bool $dryRun, int $sampleLimit): array
    {
        $stats = [
            'scanned' => 0,
            'changed' => 0,
            'updated' => 0,
            'sampleIds' => [],
        ];

        $query
            ->orderBy('id')
            ->chunkById(100, function ($records) use ($modelLabel, $sanitizer, $dryRun, $sampleLimit, &$stats): void {
                foreach ($records as $record) {
                    $stats['scanned']++;

                    $raw = $record->getRawOriginal('content');
                    $sanitized = $sanitizer->sanitize($raw);

                    if ($raw === $sanitized) {
                        continue;
                    }

                    $stats['changed']++;
                    if (count($stats['sampleIds']) < $sampleLimit) {
                        $stats['sampleIds'][] = (int) $record->getKey();
                    }

                    if ($dryRun) {
                        continue;
                    }

                    $record->forceFill(['content' => $sanitized])->saveQuietly();
                    $stats['updated']++;
                }
            });

        $this->line(sprintf(
            '[%s] scanned=%d changed=%d updated=%d sample_ids=%s',
            $modelLabel,
            $stats['scanned'],
            $stats['changed'],
            $stats['updated'],
            $this->formatSampleIds($stats['sampleIds']),
        ));

        return $stats;
    }

    /**
     * @param  list<int>  $sampleIds
     */
    private function formatSampleIds(array $sampleIds): string
    {
        if ($sampleIds === []) {
            return '-';
        }

        return implode(', ', $sampleIds);
    }
}
