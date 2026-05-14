<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

class BenchmarkMode extends Command
{
    /**
     * Toggle a deterministic local benchmarking setup.
     *
     * NOTE:
     * - This command edits the `.env` file. You still need to restart your local server
     *   for changes like APP_DEBUG to take effect.
     */
    protected $signature = 'app:benchmark {state=status : on|off|status}';

    protected $description = 'Toggle benchmark mode (debug off + caches on) for more consistent local performance measurements.';

    public function handle(): int
    {
        $state = Str::lower((string) $this->argument('state'));
        if (! in_array($state, ['on', 'off', 'status'], true)) {
            $this->error('Invalid state. Use: on | off | status');

            return self::FAILURE;
        }

        $envPath = base_path('.env');
        if (! is_file($envPath)) {
            $this->error('No .env file found at: '.$envPath);

            return self::FAILURE;
        }

        $contents = file_get_contents($envPath);
        if ($contents === false) {
            $this->error('Unable to read .env file.');

            return self::FAILURE;
        }

        if ($state === 'status') {
            $this->line('Benchmark mode flag: '.(config('app.benchmark_mode') ? 'ON' : 'OFF'));
            $this->line('APP_DEBUG: '.(config('app.debug') ? 'true' : 'false'));
            $this->line('Config cached: '.(app()->configurationIsCached() ? 'yes' : 'no'));
            $this->line('Routes cached: '.(app()->routesAreCached() ? 'yes' : 'no'));

            return self::SUCCESS;
        }

        $isOn = $state === 'on';

        $contents = $this->setEnvValue($contents, 'BENCHMARK_MODE', $isOn ? 'true' : 'false');
        $contents = $this->setEnvValue($contents, 'APP_DEBUG', $isOn ? 'false' : 'true');
        $contents = $this->setEnvValue($contents, 'LOG_LEVEL', $isOn ? 'warning' : 'debug');

        if (file_put_contents($envPath, $contents) === false) {
            $this->error('Unable to write .env file.');

            return self::FAILURE;
        }

        // Apply caches for the current process (useful for CLI benchmarks). For web, restart server.
        if ($isOn) {
            Artisan::call('optimize:clear');
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('event:cache');
            Artisan::call('view:cache');
            $this->info('Benchmark mode: ON (debug off, caches ON)');
        } else {
            Artisan::call('optimize:clear');
            $this->info('Benchmark mode: OFF (debug on, caches cleared)');
        }

        $this->newLine();
        $this->warn('Important: restart your local server to apply APP_DEBUG changes.');
        $this->line('Run: php artisan app:benchmark status');

        return self::SUCCESS;
    }

    private function setEnvValue(string $contents, string $key, string $value): string
    {
        $pattern = '/^'.preg_quote($key, '/').'=.*/m';

        if (preg_match($pattern, $contents) === 1) {
            return preg_replace($pattern, $key.'='.$value, $contents) ?? $contents;
        }

        $suffix = str_ends_with($contents, "\n") ? '' : "\n";

        return $contents.$suffix.$key.'='.$value."\n";
    }
}
