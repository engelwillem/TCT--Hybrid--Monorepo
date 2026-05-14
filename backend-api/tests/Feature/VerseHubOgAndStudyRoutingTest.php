<?php

namespace Tests\Feature;

use App\Models\BibleVerse;
use App\Models\StudyPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerseHubOgAndStudyRoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_open_study_index_route_without_being_captured_by_generic_ref_route(): void
    {
        StudyPath::query()->create([
            'slug' => 'who-is-jesus',
            'title_id' => 'Siapa Yesus',
            'title_en' => 'Who Is Jesus',
            'description_id' => 'Mengenal Yesus dari Alkitab',
            'description_en' => 'Knowing Jesus from Scripture',
            'cover_color' => 'amber',
            'difficulty' => 'beginner',
            'estimated_minutes' => 20,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        $this->get('/versehub/id/study')
            ->assertOk()
            ->assertJsonPath('lang', 'id')
            ->assertJsonCount(1, 'paths');
    }

    public function test_guest_can_access_study_og_png(): void
    {
        StudyPath::query()->create([
            'slug' => 'who-is-jesus',
            'title_id' => 'Siapa Yesus',
            'title_en' => 'Who Is Jesus',
            'description_id' => 'Mengenal Yesus dari Alkitab',
            'description_en' => 'Knowing Jesus from Scripture',
            'cover_color' => 'amber',
            'difficulty' => 'beginner',
            'estimated_minutes' => 20,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        $this->get('/versehub/id/study/who-is-jesus/og.png')
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    }

    public function test_chapter_reader_contains_chapter_og_image_url_prop(): void
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

        $this->get('/versehub/id/yoh-3')
            ->assertRedirect(url('/versehub/id/yoh-3-1'));
    }

    public function test_chapter_og_alias_redirects_to_canonical_ref(): void
    {
        BibleVerse::query()->create([
            'provider' => 'ayt',
            'lang' => 'id',
            'book_code' => '1ptr',
            'chapter' => 3,
            'verse' => 1,
            'reference' => '1 Petrus 3:1',
            'text' => 'Demikian juga kamu, hai isteri-isteri...',
            'translation_name' => 'AYT',
        ]);

        $this->get('/versehub/id/1ptr_3/og.png')
            ->assertRedirect(url('/versehub/id/1ptr-3-1/og.png'));
    }
}
