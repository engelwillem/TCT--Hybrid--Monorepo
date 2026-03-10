<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Post;
use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class InitialContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedWeeklyChannelsAndPosts();
        $this->seedDailyVerseChannelAndPost();
        $this->ensureSabbathSchoolQ12026Lesson1HasContent();
    }

    private function seedWeeklyChannelsAndPosts(): void
    {
        $now = Carbon::now();
        $todayMorning = $now->copy()->startOfDay()->addHours(7);

        $channels = [
            'faith-journey' => [
                'title' => 'FaithJourney',
                'description' => 'Berita Misi (Sabtu)',
            ],
            'family' => [
                'title' => 'Family',
                'description' => 'Pelajaran RumahTangga (Minggu)',
            ],
            'god-first' => [
                'title' => 'GodFirst',
                'description' => 'Bacaan Persembahan (Sabtu)',
            ],
        ];

        foreach ($channels as $slug => $payload) {
            $channel = Channel::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $payload['title'],
                    'description' => $payload['description'],
                    'type' => 'weekly',
                    'cover_image_url' => null,
                ],
            );

            $existingPublished = Post::query()
                ->where('channel_id', $channel->id)
                ->where('status', 'published')
                ->where('publish_at', '>=', $now->copy()->subDay()->startOfDay())
                ->exists();

            if ($existingPublished) {
                continue;
            }

            Post::query()->updateOrCreate(
                [
                    'channel_id' => $channel->id,
                    'publish_at' => $todayMorning->copy(),
                ],
                [
                    'title' => "{$payload['title']} — First Post",
                    'content' => '<p>Konten awal channel untuk memastikan halaman weekly langsung terisi.</p>',
                    'status' => 'published',
                    'published_at' => $now->copy(),
                    'meta' => null,
                ],
            );
        }
    }

    private function seedDailyVerseChannelAndPost(): void
    {
        $channel = Channel::query()->updateOrCreate(
            ['slug' => 'versehub-daily'],
            [
                'title' => 'DailyVerse',
                'description' => '(admin post).',
                'type' => 'versehub',
                'cover_image_url' => null,
            ],
        );

        $todayJakarta = Carbon::now('Asia/Jakarta');
        $publishAtAppTz = $todayJakarta
            ->copy()
            ->setTime(6, 0)
            ->timezone(config('app.timezone', 'UTC'));

        Post::query()->updateOrCreate(
            [
                'channel_id' => $channel->id,
                'publish_at' => $publishAtAppTz,
            ],
            [
                'title' => 'Daily Verse — FLM 1:15',
                'content' => null,
                'status' => 'published',
                'published_at' => Carbon::now(),
                'meta' => [
                    'kind' => 'versehub_daily',
                    'book_code' => 'flm',
                    'chapter' => 1,
                    'verse' => 15,
                    'quote' => 'Sebab mungkin karena itulah dia dipisahkan sejenak daripadamu, supaya engkau dapat menerimanya untuk selama-lamanya.',
                    'cta_label' => 'Baca ayat hari ini',
                    'cta_href' => '/versehub/id/flm-1-15',
                ],
            ],
        );
    }

    private function ensureSabbathSchoolQ12026Lesson1HasContent(): void
    {
        $q1Start = Carbon::parse('2025-12-27');
        $q1End = $q1Start->copy()->addDays(90);

        $quarter = SsQuarter::query()->updateOrCreate(
            ['year' => 2026, 'quarter' => 1],
            [
                'title' => 'Q1 2026',
                'start_date' => $q1Start->toDateString(),
                'end_date' => $q1End->toDateString(),
                'is_active' => true,
            ],
        );

        $lesson = SsLesson::query()->updateOrCreate(
            ['quarter_id' => $quarter->id, 'lesson_number' => 1],
            [
                'title' => 'Lesson 1',
                'start_date' => $q1Start->toDateString(),
                'end_date' => $q1Start->copy()->addDays(6)->toDateString(),
            ],
        );

        $satDay = SsDay::query()->updateOrCreate(
            ['lesson_id' => $lesson->id, 'day_key' => 'sat'],
            [
                'date' => $q1Start->toDateString(),
                'title' => 'Lesson 1 (Preview)',
                'content' => '<p>Konten minimal Sabbath School untuk memastikan halaman bisa dirender tanpa 404.</p>',
                'status' => 'published',
            ],
        );

        if (blank($satDay->title) || blank($satDay->content) || $satDay->status !== 'published') {
            $satDay->title = 'Lesson 1 (Preview)';
            $satDay->content = '<p>Konten minimal Sabbath School untuk memastikan halaman bisa dirender tanpa 404.</p>';
            $satDay->status = 'published';
            $satDay->save();
        }
    }
}

