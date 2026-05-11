<?php

namespace Tests;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Keep feature tests focused on app behavior, not token wiring.
        $this->withoutMiddleware(ValidateCsrfToken::class);

        if (app()->environment('testing')) {
            $defaultConnection = (string) config('database.default');
            $databaseName = (string) config("database.connections.{$defaultConnection}.database");

            $isSqliteTestingDb = $defaultConnection === 'sqlite'
                && str_contains(str_replace('\\', '/', $databaseName), 'database/testing.sqlite');

            if (! $isSqliteTestingDb) {
                throw new RuntimeException(
                    "Unsafe test database configuration detected. Tests must use sqlite database/testing.sqlite, got [{$defaultConnection}] [{$databaseName}]."
                );
            }
        }
    }
}
