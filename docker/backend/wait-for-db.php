<?php

declare(strict_types=1);

$host = getenv('DB_HOST') ?: 'mariadb';
$port = getenv('DB_PORT') ?: '3306';
$database = getenv('DB_DATABASE') ?: 'thechoosentalks';
$username = getenv('DB_USERNAME') ?: 'tct';
$password = getenv('DB_PASSWORD') ?: 'tct';

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%s;dbname=%s', $host, $port, $database),
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $pdo->query('SELECT 1');
    fwrite(STDOUT, "db-ok\n");
} catch (Throwable $e) {
    fwrite(STDERR, $e->getMessage() . PHP_EOL);
    exit(1);
}
