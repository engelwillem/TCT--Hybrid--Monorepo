<?php

namespace Tests\Feature;

use Tests\TestCase;

class TodayV2SessionApiTest extends TestCase
{
    public function test_today_v2_session_endpoint_returns_contract_payload(): void
    {
        $response = $this->getJson('/api/today-v2/session');

        $response->assertOk();
        $response->assertJsonPath('contractVersion', 'today-v2.session.v1');

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

    public function test_today_v2_session_uses_dated_content_file_when_available(): void
    {
        config()->set('today_v2.content_path', 'content/today-v2');
        config()->set('today_v2.default_file', 'default.php');
        config()->set('today_v2.date_override', '2026-03-21');

        $response = $this->getJson('/api/today-v2/session');

        $response->assertOk();
        $response->assertJsonPath('openingLine', 'Hari ini baru dimulai. Mari melangkah dengan hati yang teduh.');
        $response->assertJsonPath('verse.reference', 'Ratapan 3:22-23');
    }

    public function test_today_v2_session_falls_back_to_default_file_when_today_file_is_missing(): void
    {
        config()->set('today_v2.content_path', 'content/today-v2');
        config()->set('today_v2.default_file', 'default.php');
        config()->set('today_v2.date_override', '2099-12-31');

        $response = $this->getJson('/api/today-v2/session');

        $response->assertOk();
        $response->assertJsonPath('openingLine', 'Tarik napas perlahan. Tuhan hadir menemani ritmemu hari ini.');
        $response->assertJsonPath('verse.reference', 'Mazmur 37:5');
    }

    public function test_today_v2_session_uses_preview_date_query_when_allowed(): void
    {
        config()->set('today_v2.content_path', 'content/today-v2');
        config()->set('today_v2.default_file', 'default.php');
        config()->set('today_v2.date_override', '2099-12-31');

        $response = $this->getJson('/api/today-v2/session?previewDate=2026-03-21');

        $response->assertOk();
        $response->assertHeader('X-Today-V2-Preview-Date', '2026-03-21');
        $response->assertHeader('X-Today-V2-Preview-Fallback', '0');
        $response->assertJsonPath('openingLine', 'Hari ini baru dimulai. Mari melangkah dengan hati yang teduh.');
    }

    public function test_today_v2_session_ignores_invalid_preview_date_format(): void
    {
        config()->set('today_v2.content_path', 'content/today-v2');
        config()->set('today_v2.default_file', 'default.php');
        config()->set('today_v2.date_override', '2099-12-31');

        $response = $this->getJson('/api/today-v2/session?previewDate=20260321');

        $response->assertOk();
        $response->assertHeaderMissing('X-Today-V2-Preview-Date');
        $response->assertJsonPath('openingLine', 'Tarik napas perlahan. Tuhan hadir menemani ritmemu hari ini.');
    }
}
