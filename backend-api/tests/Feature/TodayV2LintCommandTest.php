<?php

namespace Tests\Feature;

use Illuminate\Filesystem\Filesystem;
use Tests\TestCase;

class TodayV2LintCommandTest extends TestCase
{
    public function test_lint_command_passes_for_valid_dated_content(): void
    {
        config()->set('today_v2.content_path', 'content/today-v2');
        config()->set('today_v2.default_file', 'default.php');

        $this->artisan('today-v2:lint --date=2026-03-21')
            ->expectsOutputToContain('Fallback used: no')
            ->expectsOutputToContain('Lint passed (no critical errors).')
            ->assertExitCode(0);
    }

    public function test_lint_command_fails_on_invalid_date_option(): void
    {
        $this->artisan('today-v2:lint --date=20260321')
            ->expectsOutputToContain('Invalid --date format. Use YYYY-MM-DD.')
            ->assertExitCode(1);
    }

    public function test_lint_command_returns_failure_when_payload_has_required_errors(): void
    {
        $relativeFixturePath = 'content/today-v2-lint-fixture-'.uniqid();
        $fixturePath = base_path($relativeFixturePath);
        $filesystem = new Filesystem;

        if (! is_dir($fixturePath)) {
            mkdir($fixturePath, 0777, true);
        }

        file_put_contents($fixturePath.'/default.php', "<?php return ['contractVersion' => 'wrong.version'];");

        config()->set('today_v2.content_path', $relativeFixturePath);
        config()->set('today_v2.default_file', 'default.php');
        config()->set('today_v2.date_override', '2099-12-31');

        try {
            $this->artisan('today-v2:lint')
                ->expectsOutputToContain('Fallback used: yes')
                ->expectsOutputToContain('Lint failed. Please fix errors before publish/deploy.')
                ->assertExitCode(1);
        } finally {
            $filesystem->deleteDirectory($fixturePath);
        }
    }
}
