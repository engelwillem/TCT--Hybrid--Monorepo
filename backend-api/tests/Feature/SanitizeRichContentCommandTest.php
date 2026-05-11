<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SanitizeRichContentCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_dry_run_reports_changes_without_updating_rows(): void
    {
        [$postId, $ssDayId] = $this->seedUnsafeRichContent();

        Artisan::call('app:sanitize-rich-content', ['--dry-run' => true, '--sample' => 1]);
        $output = Artisan::output();

        $postContent = (string) DB::table('posts')->where('id', $postId)->value('content');
        $ssDayContent = (string) DB::table('ss_days')->where('id', $ssDayId)->value('content');

        $this->assertStringContainsString('sample_ids=', $output);
        $this->assertStringContainsString((string) $postId, $output);
        $this->assertStringContainsString((string) $ssDayId, $output);
        $this->assertStringContainsString('onclick', $postContent);
        $this->assertStringContainsString('<script', $ssDayContent);
    }

    public function test_command_normalizes_legacy_rows_in_place(): void
    {
        [$postId, $ssDayId] = $this->seedUnsafeRichContent();

        Artisan::call('app:sanitize-rich-content');

        $postContent = (string) DB::table('posts')->where('id', $postId)->value('content');
        $ssDayContent = (string) DB::table('ss_days')->where('id', $ssDayId)->value('content');

        $this->assertStringNotContainsString('onclick', $postContent);
        $this->assertStringNotContainsString('javascript:alert', $postContent);
        $this->assertStringContainsString('Halo', $postContent);

        $this->assertStringNotContainsString('<script', $ssDayContent);
        $this->assertStringNotContainsString('onclick', $ssDayContent);
        $this->assertStringContainsString('<p>Renungan</p>', $ssDayContent);
    }

    /**
     * @return array{0:int,1:int}
     */
    private function seedUnsafeRichContent(): array
    {
        DB::table('channels')->insert([
            'slug' => 'command-sanitize-channel',
            'title' => 'Command Channel',
            'description' => null,
            'cover_image_url' => null,
            'type' => 'weekly',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $channelId = (int) DB::table('channels')->where('slug', 'command-sanitize-channel')->value('id');

        $post = Post::query()->create([
            'channel_id' => $channelId,
            'title' => 'Legacy Unsafe Post',
            'content' => '<p>placeholder</p>',
            'publish_at' => now(),
            'status' => 'published',
            'published_at' => now(),
        ]);

        DB::table('posts')
            ->where('id', $post->id)
            ->update(['content' => '<p onclick="alert(1)">Halo</p><a href="javascript:alert(1)">bad</a>']);

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

        $day = SsDay::query()->create([
            'lesson_id' => $lesson->id,
            'day_key' => 'mon',
            'date' => '2026-04-06',
            'title' => 'Legacy Unsafe Day',
            'content' => '<p>seed</p>',
            'media_links' => null,
            'cover_image_url' => 'https://example.com/cover.jpg',
            'status' => 'published',
        ]);

        DB::table('ss_days')
            ->where('id', $day->id)
            ->update(['content' => '<div onclick="alert(1)"><p>Renungan</p><script>alert(1)</script></div>']);

        return [$post->id, $day->id];
    }
}
