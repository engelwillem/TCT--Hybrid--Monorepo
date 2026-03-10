<?php

namespace Tests\Feature;

use App\Models\BibleVerse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerseHubMentorApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_insights_returns_transparent_shape_for_verse(): void
    {
        BibleVerse::query()->create([
            'provider' => 'ayt',
            'lang' => 'id',
            'book_code' => 'yoh',
            'chapter' => 3,
            'verse' => 16,
            'reference' => 'Yohanes 3:16',
            'text' => 'Karena begitu besar kasih Allah akan dunia ini...',
            'translation_name' => 'AYT',
        ]);

        $response = $this->getJson('/versehub/id/yoh-3-16/mentor');

        $response->assertOk()->assertJsonStructure([
            'ref',
            'query',
            'mentor_label',
            'insights' => [
                'reflection_questions',
                'theme_connections',
                'historical_context',
            ],
            'relationships',
            'themes',
            'active_study_paths',
        ]);
    }

    public function test_mentor_ask_returns_scripture_first_sections(): void
    {
        BibleVerse::query()->create([
            'provider' => 'ayt',
            'lang' => 'id',
            'book_code' => 'yoh',
            'chapter' => 3,
            'verse' => 16,
            'reference' => 'Yohanes 3:16',
            'text' => 'Karena begitu besar kasih Allah akan dunia ini...',
            'translation_name' => 'AYT',
        ]);

        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->postJson('/versehub/id/yoh-3-16/mentor/ask', [
                'question' => 'Apa makna ayat ini?',
            ]);

        $response->assertOk()->assertJsonStructure([
            'answer',
            'interpretation',
            'study_guidance',
            'related_refs',
            'confidence',
            'scripture_basis' => [
                'anchor_ref',
                'anchor_text_excerpt',
                'related_refs',
            ],
            'sections' => [
                'biblical_text',
                'interpretation',
                'study_guidance',
            ],
            'mentor_label',
            'disclaimer_id',
        ]);

        $response->assertJsonPath('scripture_basis.anchor_ref', 'yoh-3-16');
    }

    public function test_mentor_og_image_endpoint_returns_png(): void
    {
        BibleVerse::query()->create([
            'provider' => 'ayt',
            'lang' => 'id',
            'book_code' => 'yoh',
            'chapter' => 3,
            'verse' => 16,
            'reference' => 'Yohanes 3:16',
            'text' => 'Karena begitu besar kasih Allah akan dunia ini...',
            'translation_name' => 'AYT',
        ]);

        $response = $this->get('/versehub/id/yoh-3-16/mentor/og.png?q=Apa%20makna%20ayat%20ini&summary=Belajar%20dengan%20pendekatan%20scripture-first');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/png');
    }
}
