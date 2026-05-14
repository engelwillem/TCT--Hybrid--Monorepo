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

            $normalizedDatabaseName = str_replace('\\', '/', $databaseName);
            $isSqliteTestingDb = $defaultConnection === 'sqlite'
                && (
                    $normalizedDatabaseName === ':memory:'
                    || str_contains($normalizedDatabaseName, 'database/testing.sqlite')
                );

            if (! $isSqliteTestingDb) {
                throw new RuntimeException(
                    "Unsafe test database configuration detected. Tests must use sqlite :memory: or database/testing.sqlite, got [{$defaultConnection}] [{$databaseName}]."
                );
            }
        }
    }
}
