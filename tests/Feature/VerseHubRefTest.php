<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VerseHubRefTest extends TestCase
{
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
}
