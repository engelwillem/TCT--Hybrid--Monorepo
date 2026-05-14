<?php

namespace Tests\Feature;

use Tests\TestCase;

class TodaySessionApiTest extends TestCase
{
    public function test_today_session_endpoint_returns_contract_payload(): void
    {
        $response = $this->getJson('/api/today/session');

        $response->assertOk();
        $response->assertJsonPath('contractVersion', 'today.session.v1');

        $response->assertJsonStructure([
            'contractVersion',
            'user' => ['name', 'avatarInitial'],
            'greeting',
            'dateLabel',
            'openingLine',
            'verse' => ['label', 'text', 'reference'],
            'reflection' => ['prompt', 'placeholder', 'ctaLabel', 'sealedLabel'],
            'prayer' => ['label', 'text', 'ctaLabel', 'completionLabel'],
            'completion' => [
                'title',
                'body',
                'softProgressLabel',
                'progressValue',
                'tomorrowCueLabel',
                'tomorrowCueText',
            ],
        ]);

        $response->assertJsonPath('openingLine', fn (mixed $value) => is_string($value) && trim($value) !== '');
        $response->assertJsonPath('verse.text', fn (mixed $value) => is_string($value) && trim($value) !== '');
        $response->assertJsonPath('verse.reference', fn (mixed $value) => is_string($value) && trim($value) !== '');
        $response->assertJsonPath('reflection.prompt', fn (mixed $value) => is_string($value) && trim($value) !== '');
        $response->assertJsonPath('prayer.text', fn (mixed $value) => is_string($value) && trim($value) !== '');
        $response->assertJsonPath('completion.title', fn (mixed $value) => is_string($value) && trim($value) !== '');
        $response->assertJsonPath('completion.body', fn (mixed $value) => is_string($value) && trim($value) !== '');
        $response->assertJsonPath('completion.tomorrowCueText', fn (mixed $value) => is_string($value) && trim($value) !== '');
    }

    public function test_today_session_uses_dated_content_file_when_available(): void
    {
        config()->set('today.content_path', 'content/today');
        config()->set('today.default_file', 'default.php');
        config()->set('today.date_override', '2026-03-21');

        $response = $this->getJson('/api/today/session');

        $response->assertOk();
        $response->assertJsonPath('openingLine', 'Hari ini baru dimulai. Mari melangkah dengan hati yang teduh.');
        $response->assertJsonPath('verse.reference', 'Ratapan 3:22-23');
    }

    public function test_today_session_falls_back_to_default_file_when_today_file_is_missing(): void
    {
        config()->set('today.content_path', 'content/today');
        config()->set('today.default_file', 'default.php');
        config()->set('today.date_override', '2099-12-31');

        $response = $this->getJson('/api/today/session');

        $response->assertOk();
        $response->assertJsonPath('openingLine', 'Take a slow breath. God is present with you in today\'s rhythm.');
        $response->assertJsonPath('verse.reference', fn (mixed $value) => is_string($value) && trim($value) !== '');
    }

    public function test_today_session_uses_preview_date_query_when_allowed(): void
    {
        config()->set('today.content_path', 'content/today');
        config()->set('today.default_file', 'default.php');
        config()->set('today.date_override', '2099-12-31');

        $response = $this->getJson('/api/today/session?previewDate=2026-03-21');

        $response->assertOk();
        $response->assertHeader('X-Today-Preview-Date', '2026-03-21');
        $response->assertHeader('X-Today-Preview-Fallback', '0');
        $response->assertJsonPath('openingLine', 'Hari ini baru dimulai. Mari melangkah dengan hati yang teduh.');
    }

    public function test_today_session_ignores_invalid_preview_date_format(): void
    {
        config()->set('today.content_path', 'content/today');
        config()->set('today.default_file', 'default.php');
        config()->set('today.date_override', '2099-12-31');

        $response = $this->getJson('/api/today/session?previewDate=20260321');

        $response->assertOk();
        $response->assertHeaderMissing('X-Today-Preview-Date');
        $response->assertJsonPath('openingLine', 'Take a slow breath. God is present with you in today\'s rhythm.');
    }

    public function test_today_session_default_verse_rotates_when_date_changes(): void
    {
        config()->set('today.content_path', 'content/today');
        config()->set('today.default_file', 'default.php');

        config()->set('today.date_override', '2099-12-31');
        $firstResponse = $this->getJson('/api/today/session');
        $firstResponse->assertOk();

        config()->set('today.date_override', '2100-01-01');
        $secondResponse = $this->getJson('/api/today/session');
        $secondResponse->assertOk();

        $firstReference = (string) $firstResponse->json('verse.reference');
        $secondReference = (string) $secondResponse->json('verse.reference');

        $this->assertNotSame(
            $firstReference,
            $secondReference,
            'Verse-of-day should rotate when the date changes.'
        );
    }
}
