<?php

namespace App\Console\Commands;

use App\Support\TodaySessionContentLint;
use App\Support\TodaySessionContentSource;
use Illuminate\Console\Command;

class TodayLintCommand extends Command
{
    protected $signature = 'today:lint {--date= : Validate a specific date key (YYYY-MM-DD)}';

    protected $description = 'Lint today daily content payload shape and editorial safety before serving the API.';

    public function handle(TodaySessionContentSource $source, TodaySessionContentLint $lint): int
    {
        $date = $this->option('date');
        if ($date !== null && $date !== '' && ! preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $date)) {
            $this->error('Invalid --date format. Use YYYY-MM-DD.');

            return self::FAILURE;
        }

        $forcedDate = is_string($date) && $date !== '' ? $date : null;
        $resolved = $source->resolveWithMeta($forcedDate);
        $report = $lint->lint($resolved['payload']);

        $this->info('Today Content Lint');
        $this->line('Date key: '.$resolved['dateKey']);
        $this->line('Source file: '.($resolved['sourceFile'] ?? '(none)'));
        $this->line('Fallback used: '.($resolved['fallbackUsed'] ? 'yes' : 'no'));
        $this->newLine();

        $this->renderGroup('ERROR', $report['errors'], fn (string $line) => $this->error($line));
        $this->renderGroup('WARNING', $report['warnings'], fn (string $line) => $this->warn($line));
        $this->renderGroup('INFO', $report['infos'], fn (string $line) => $this->line($line));

        $summary = $report['summary'];
        $this->newLine();
        $this->line(sprintf(
            'Summary: %d error(s), %d warning(s), %d info item(s).',
            $summary['errorCount'],
            $summary['warningCount'],
            $summary['infoCount']
        ));

        if ($summary['errorCount'] > 0) {
            $this->error('Lint failed. Please fix errors before publish/deploy.');

            return self::FAILURE;
        }

        $this->info('Lint passed (no critical errors).');

        return self::SUCCESS;
    }

    /**
     * @param  list<string>  $items
     * @param  callable(string): void  $renderLine
     */
    private function renderGroup(string $label, array $items, callable $renderLine): void
    {
        if ($items === []) {
            return;
        }

        $this->line($label.':');
        foreach ($items as $item) {
            $renderLine('  - '.$item);
        }
        $this->newLine();
    }
}


