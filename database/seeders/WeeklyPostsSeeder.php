<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class WeeklyPostsSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        $slugs = [
            'faith-journey' => 'FaithJourney',
            'family' => 'Family',
            'god-first' => 'GodFirst',
        ];

        foreach ($slugs as $slug => $titlePrefix) {
            $channel = Channel::query()->where('slug', $slug)->first();

            if (! $channel) {
                continue;
            }

            // Create at least one visible post so Weekly pages are not empty.
            Post::query()->updateOrCreate(
                [
                    'channel_id' => $channel->id,
                    'publish_at' => $today->copy()->subDay()->setTime(7, 0),
                ],
                [
                    'title' => "{$titlePrefix}: Sample Post",
                    'content' => '<p>Konten contoh untuk memastikan UI tidak kosong.</p>',
                    'status' => 'published',
                    'published_at' => Carbon::now(),
                ],
            );
        }
    }
}
