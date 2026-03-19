<?php

namespace App\Console\Commands;

use App\Models\BibleVerse;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportAytCsv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'versehub:import-ayt
                            {--path=storage/app/ayt/ayt.csv : Path to ayt.csv}
                            {--truncate : Truncate existing AYT rows before import}
                            {--limit=0 : Import only first N data rows (0 = all)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import AYT (Alkitab Yang Terbuka) CSV into bible_verses table';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $path = (string) $this->option('path');
        $truncate = (bool) $this->option('truncate');
        $limit = (int) $this->option('limit');

        if (! file_exists($path)) {
            $this->error("File not found: {$path}");
            $this->line('Tip: download it into storage/app/ayt/ayt.csv');

            return self::FAILURE;
        }

        if ($truncate) {
            $this->warn('Truncating existing rows for provider=ayt, lang=id ...');
            BibleVerse::query()
                ->where('provider', 'ayt')
                ->where('lang', 'id')
                ->delete();

            // Also clear FTS index (if present) so we don't keep stale rowids.
            try {
                DB::statement("DELETE FROM bible_verses_fts WHERE provider = 'ayt' AND lang = 'id'");
            } catch (\Throwable) {
                // ignore if FTS isn't installed yet
            }
        }

        $this->info('Importing AYT CSV...');
        $this->line("Source: {$path}");

        $fh = fopen($path, 'rb');
        if (! $fh) {
            $this->error('Unable to open file.');

            return self::FAILURE;
        }

        // CSV header: "id","book","abbr","chapter","verse","text","title"
        $header = fgetcsv($fh);
        if (! is_array($header) || count($header) < 6) {
            fclose($fh);
            $this->error('Invalid CSV header.');

            return self::FAILURE;
        }

        $batch = [];
        $batchSize = 1000;
        $count = 0;
        $skipped = 0;

        $bar = $this->output->createProgressBar();
        $bar->start();

        while (($row = fgetcsv($fh)) !== false) {
            if (! is_array($row) || count($row) < 6) {
                $skipped++;

                continue;
            }

            // Columns by index (as seen in raw CSV)
            // 0:id, 1:book, 2:abbr, 3:chapter, 4:verse, 5:text, 6:title(optional)
            $abbr = trim((string) ($row[2] ?? ''));
            $chapter = (int) ($row[3] ?? 0);
            $verse = (int) ($row[4] ?? 0);
            $text = (string) ($row[5] ?? '');

            if ($abbr === '' || $chapter <= 0 || $verse <= 0 || trim($text) === '') {
                $skipped++;

                continue;
            }

            // Normalize book code for VerseHub ID slug style.
            // AYT uses title-cased Indonesian book code (e.g. Kej, Mzm, Yoh, Flm).
            // We store VerseHub's slug book codes (e.g. 1kor/2kor instead of 1ko/2ko)
            $bookCode = Str::lower($abbr);
            if ($bookCode === '1ko') {
                $bookCode = '1kor';
            }
            if ($bookCode === '2ko') {
                $bookCode = '2kor';
            }

            // Clean text: remove <t /> marker and other simple tags.
            $text = preg_replace('/<\s*t\s*\/>/i', '', $text) ?? $text;
            $text = strip_tags($text);
            $text = trim(html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8'));

            $reference = strtoupper($abbr)." {$chapter}:{$verse}";
            // We keep reference minimal for now; VerseHub UI will show it anyway.

            $now = now();
            $batch[] = [
                'provider' => 'ayt',
                'lang' => 'id',
                'book_code' => $bookCode,
                'chapter' => $chapter,
                'verse' => $verse,
                'reference' => $reference,
                'text' => $text,
                'translation_name' => 'AYT',
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $count++;
            $bar->advance();

            if ($limit > 0 && $count >= $limit) {
                break;
            }

            if (count($batch) >= $batchSize) {
                $this->flushBatch($batch);
                $batch = [];
            }
        }

        if (count($batch) > 0) {
            $this->flushBatch($batch);
        }

        fclose($fh);
        $bar->finish();
        $this->newLine(2);

        $this->info("Imported rows: {$count}");
        if ($skipped > 0) {
            $this->warn("Skipped rows: {$skipped}");
        }

        return self::SUCCESS;
    }

    private function flushBatch(array $batch): void
    {
        // Use upsert for idempotency.
        DB::table('bible_verses')->upsert(
            $batch,
            ['provider', 'lang', 'book_code', 'chapter', 'verse'],
            ['reference', 'text', 'translation_name', 'updated_at']
        );
    }
}
