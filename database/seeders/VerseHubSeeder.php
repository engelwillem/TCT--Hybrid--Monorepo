<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class VerseHubSeeder extends Seeder
{
    public function run(): void
    {
        $channel = Channel::query()->updateOrCreate(
            ['slug' => 'versehub-daily'],
            [
                'title' => 'VerseHub',
                'description' => 'Ayat harian VerseHub (admin only).',
                'type' => 'versehub',
                'cover_image_url' => null,
            ],
        );

        $today = Carbon::today();

        Post::query()->updateOrCreate(
            [
                'channel_id' => $channel->id,
                'title' => 'Ayat Hari Ini',
                // Keep one post per day (by publish_at date).
                'publish_at' => $today->copy()->setTime(6, 0),
            ],
            [
                'content' => null,
                'status' => 'published',
                'published_at' => Carbon::now(),
                'meta' => [
                    'kind' => 'versehub_daily',
                    'book_code' => 'flm',
                    'chapter' => 1,
                    'verse' => 15,
                    'quote' => 'Dialah yang telah melepaskan kita dari kuasa kegelapan dan memindahkan kita ke dalam Kerajaan Anak-Nya yang kekasih.',
                    'cta_label' => 'Baca ayat hari ini',
                    'cta_href' => '/versehub/id/flm-1-15',
                ],
            ],
        );
    }
}
