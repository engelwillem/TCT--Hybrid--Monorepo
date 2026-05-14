<?php

namespace Tests\Feature;

use App\Models\BibleVerse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VerseHubRefTest extends TestCase
{
    use RefreshDatabase;

    public function test_id_ref_flm_works(): void
    {
        Http::fake([
            'https://alkitab.mobi/*' => Http::response(
                '<html><head><title>Filemon 1:15 (TB)</title></head><body><p><strong><a><span class="reftext">TB:</span></a></strong> Dummy verse text</p></body></html>',
                200
            ),
        ]);

        $this->get('/versehub/id/flm-1-15')->assertOk();
    }

    public function test_id_ref_1ptr_works(): void
    {
        Http::fake([
            'https://alkitab.mobi/*' => Http::response(
                '<html><head><title>1 Petrus 3:1 (TB)</title></head><body><p><strong><a><span class="reftext">TB:</span></a></strong> Dummy verse text</p></body></html>',
                200
            ),
        ]);

        $this->get('/versehub/id/1ptr-3-1')->assertOk();
    }

    public function test_id_ref_normalizer_handles_underscore_format(): void
    {
        Http::fake([
            'https://alkitab.mobi/*' => Http::response(
                '<html><head><title>1 Petrus 3:1 (TB)</title></head><body><p><strong><a><span class="reftext">TB:</span></a></strong> Dummy verse text</p></body></html>',
                200
            ),
        ]);

        $this->get('/versehub/id/1ptr_3_1')
            ->assertRedirect('/versehub/id/1ptr-3-1');
    }

    public function test_en_chapter_only_redirects_to_verse_1(): void
    {
        Http::fake([
            'https://bible-api.com/*' => Http::response([
                'reference' => '1 Peter 3:1',
                'text' => 'Dummy verse text',
            ], 200),
        ]);

        $this->get('/versehub/en/1pe-3')
            ->assertRedirect('/versehub/en/1pe-3-1');
    }

    public function test_id_uses_local_ayt_provider_when_available(): void
    {
        BibleVerse::query()->create([
            'provider' => 'ayt',
            'lang' => 'id',
            'book_code' => 'kej',
            'chapter' => 1,
            'verse' => 1,
            'reference' => 'Kejadian 1:1',
            'text' => 'Pada mulanya Allah menciptakan langit dan bumi.',
            'translation_name' => 'AYT',
        ]);

        Http::fake();

        $response = $this->getJson('/versehub/id/kej-1-1');
        $response->assertOk();
        $response->assertJsonPath('verse.provider', 'ayt');
        $response->assertJsonPath('verse.text', 'Pada mulanya Allah menciptakan langit dan bumi.');
        Http::assertNothingSent();
    }

    public function test_en_uses_online_provider_with_bearer_key_when_configured(): void
    {
        config()->set('services.english_bible.base_url', 'https://example-bible-provider.test');
        config()->set('services.english_bible.translation', 'kjv');
        config()->set('services.english_bible.api_key', 'english-test-key');
        config()->set('services.english_bible.auth_mode', 'bearer');

        Http::fake([
            'https://example-bible-provider.test/*' => Http::response([
                'reference' => 'Genesis 1:1',
                'text' => 'In the beginning God created the heaven and the earth.',
                'translation_name' => 'KJV',
            ], 200),
        ]);

        $response = $this->getJson('/versehub/en/gen-1-1');
        $response->assertOk();
        $response->assertJsonPath('verse.provider', 'bible-api.com');
        Http::assertSent(function ($request) {
            return str_starts_with($request->url(), 'https://example-bible-provider.test/')
                && $request->hasHeader('Authorization', 'Bearer english-test-key');
        });
    }
}
