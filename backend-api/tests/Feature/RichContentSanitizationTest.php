<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RichContentSanitizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_content_is_sanitized_before_it_is_saved(): void
    {
        DB::table('channels')->insert([
            'slug' => 'sanitized-weekly',
            'title' => 'Sanitized Weekly',
            'description' => 'Audit channel',
            'cover_image_url' => null,
            'type' => 'weekly',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $channelId = (int) DB::table('channels')->where('slug', 'sanitized-weekly')->value('id');

        $post = Post::query()->create([
            'channel_id' => $channelId,
            'title' => 'Unsafe Post',
            'content' => '<p onclick="alert(1)">Halo</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>',
            'publish_at' => now(),
            'status' => 'published',
            'published_at' => now(),
        ]);

        $stored = (string) DB::table('posts')->where('id', $post->id)->value('content');

        $this->assertStringContainsString('Halo', $stored);
        $this->assertStringContainsString('<a rel="noopener noreferrer">bad</a>', $stored);
        $this->assertStringNotContainsString('onclick', $stored);
        $this->assertStringNotContainsString('<script', $stored);
        $this->assertStringNotContainsString('javascript:alert', $stored);
    }

    public function test_weekly_api_sanitizes_legacy_post_content_on_read(): void
    {
        DB::table('channels')->insert([
            'slug' => 'faith-journey',
            'title' => 'Faith Journey',
            'description' => 'Legacy channel',
            'cover_image_url' => null,
            'type' => 'weekly',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $channelId = (int) DB::table('channels')->where('slug', 'faith-journey')->value('id');
        $publishAt = Carbon::parse('2026-04-06 07:00:00');

        DB::table('posts')->insert([
            'channel_id' => $channelId,
            'title' => 'Legacy Unsafe Weekly',
            'content' => '<p><strong>Aman</strong></p><img src="javascript:alert(1)" alt="x"><iframe src="https://evil.test"></iframe>',
            'publish_at' => $publishAt,
            'status' => 'published',
            'published_at' => $publishAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/channels/faith-journey/2026-04-06');

        $response->assertOk();
        $content = (string) $response->json('post.content');

        $this->assertStringContainsString('<p><strong>Aman</strong></p>', $content);
        $this->assertStringNotContainsString('javascript:alert', $content);
        $this->assertStringNotContainsString('<iframe', $content);
    }

    public function test_sabbath_school_api_sanitizes_legacy_day_content_on_read(): void
    {
        $quarter = SsQuarter::query()->create([
            'year' => 2026,
            'quarter' => 2,
            'title' => 'Quarter 2',
            'start_date' => '2026-04-01',
            'end_date' => '2026-06-30',
            'is_active' => true,
        ]);

        $lesson = SsLesson::query()->create([
            'quarter_id' => $quarter->id,
            'lesson_number' => 1,
            'title' => 'Lesson 1',
            'start_date' => '2026-04-01',
            'end_date' => '2026-04-07',
        ]);

        DB::table('ss_days')->insert([
            'lesson_id' => $lesson->id,
            'day_key' => 'mon',
            'date' => '2026-04-06',
            'title' => 'Legacy Unsafe Day',
            'content' => '<div onclick="alert(1)"><p>Renungan</p><a href="/renungan">lanjut</a><script>alert(1)</script></div>',
            'media_links' => null,
            'cover_image_url' => 'https://example.com/cover.jpg',
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/sabbath-school/2026/q2/lesson/1/mon');

        $response->assertOk();
        $content = (string) $response->json('day.content');

        $this->assertStringContainsString('<div><p>Renungan</p><a href="/renungan" rel="noopener noreferrer">lanjut</a></div>', $content);
        $this->assertStringNotContainsString('onclick', $content);
        $this->assertStringNotContainsString('<script', $content);
    }
}
