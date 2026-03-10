<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateSqliteToMysqlCommand extends Command
{
    protected $signature = 'db:migrate-sqlite-to-mysql
                            {--source-connection=sqlite_legacy : Source connection name (must be sqlite)}
                            {--source-sqlite= : Absolute path to source sqlite file (overrides source connection database)}
                            {--target-connection=mysql : Target connection name (must be mysql/mariadb)}
                            {--chunk=1000 : Batch size per insert}
                            {--truncate : Truncate target tables before copy}
                            {--tables= : Comma-separated table list to migrate}
                            {--exclude=migrations : Comma-separated tables to exclude}
                            {--dry-run : Print plan only without writing data}';

    protected $description = 'Copy application data from SQLite to MySQL/MariaDB for production cutover';

    public function handle(): int
    {
        $sourceConnection = (string) $this->option('source-connection');
        $targetConnection = (string) $this->option('target-connection');
        $chunk = max(100, (int) $this->option('chunk'));
        $dryRun = (bool) $this->option('dry-run');
        $truncate = (bool) $this->option('truncate');

        $sourceDriver = (string) config("database.connections.{$sourceConnection}.driver");
        $targetDriver = (string) config("database.connections.{$targetConnection}.driver");

        if ($sourceDriver !== 'sqlite') {
            $this->error("Source connection '{$sourceConnection}' must use sqlite driver.");
            return self::FAILURE;
        }

        if (! in_array($targetDriver, ['mysql', 'mariadb'], true)) {
            $this->error("Target connection '{$targetConnection}' must use mysql/mariadb driver.");
            return self::FAILURE;
        }

        $sourceSqliteOverride = trim((string) $this->option('source-sqlite'));
        if ($sourceSqliteOverride !== '') {
            config(["database.connections.{$sourceConnection}.database" => $sourceSqliteOverride]);
        }

        $sourceSqlitePath = (string) config("database.connections.{$sourceConnection}.database");
        if ($sourceSqlitePath === '' || ! is_file($sourceSqlitePath)) {
            $this->error("SQLite source file not found: {$sourceSqlitePath}");
            return self::FAILURE;
        }

        try {
            DB::connection($sourceConnection)->getPdo();
            DB::connection($targetConnection)->getPdo();
        } catch (\Throwable $e) {
            $this->error('Database connection failed: '.$e->getMessage());
            return self::FAILURE;
        }

        $tablesOption = $this->csvOption('tables');
        $exclude = $this->csvOption('exclude');

        $tables = count($tablesOption) > 0
            ? $tablesOption
            : $this->discoverSourceTables($sourceConnection);

        $tables = array_values(array_filter($tables, fn (string $table) => ! in_array($table, $exclude, true)));
        if (count($tables) === 0) {
            $this->warn('No table selected for migration.');
            return self::SUCCESS;
        }

        foreach ($tables as $table) {
            if (! Schema::connection($targetConnection)->hasTable($table)) {
                $this->error("Target table missing: {$table}. Run migrations on target first.");
                return self::FAILURE;
            }
        }

        $this->info("Source: {$sourceConnection} ({$sourceSqlitePath})");
        $this->info("Target: {$targetConnection}");
        $this->line('Tables: '.implode(', ', $tables));
        $this->line("Mode: chunk={$chunk}, truncate=".($truncate ? 'yes' : 'no').', dry-run='.($dryRun ? 'yes' : 'no'));

        if ($dryRun) {
            foreach ($tables as $table) {
                $count = (int) DB::connection($sourceConnection)->table($table)->count();
                $this->line("[dry-run] {$table}: {$count} rows");
            }

            return self::SUCCESS;
        }

        $target = DB::connection($targetConnection);
        $target->disableQueryLog();
        DB::connection($sourceConnection)->disableQueryLog();

        $target->statement('SET FOREIGN_KEY_CHECKS=0');
        try {
            foreach ($tables as $table) {
                $sourceCount = (int) DB::connection($sourceConnection)->table($table)->count();
                $this->warn("Migrating {$table} ({$sourceCount} rows) ...");

                if ($truncate) {
                    $target->table($table)->truncate();
                }

                $migrated = 0;
                $page = 1;
                while (true) {
                    $rows = DB::connection($sourceConnection)
                        ->table($table)
                        ->forPage($page, $chunk)
                        ->get();

                    if ($rows->isEmpty()) {
                        break;
                    }

                    $payload = [];
                    foreach ($rows as $row) {
                        $payload[] = (array) $row;
                    }

                    $target->table($table)->insert($payload);
                    $migrated += count($payload);
                    $page++;
                }

                $targetCount = (int) $target->table($table)->count();
                $this->info("Done {$table}: migrated={$migrated}, target_count={$targetCount}");
            }
        } finally {
            $target->statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $this->info('SQLite -> MySQL migration completed.');
        return self::SUCCESS;
    }

    /**
     * @return list<string>
     */
    private function discoverSourceTables(string $sourceConnection): array
    {
        $rows = DB::connection($sourceConnection)->select(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC"
        );

        $tables = [];
        foreach ($rows as $row) {
            $name = trim((string) ($row->name ?? ''));
            if ($name === '') {
                continue;
            }

            // SQLite FTS and shadow tables are engine-specific and should not be copied
            // to MySQL because target schema does not define them.
            if (preg_match('/_fts($|_)/', $name) === 1) {
                continue;
            }

            if ($name !== '') {
                $tables[] = $name;
            }
        }

        return $tables;
    }

    /**
     * @return list<string>
     */
    private function csvOption(string $name): array
    {
        $raw = trim((string) $this->option($name));
        if ($raw === '') {
            return [];
        }

        $items = array_map('trim', explode(',', $raw));
        $items = array_filter($items, fn (string $v) => $v !== '');

        return array_values(array_unique($items));
    }
}
