<?php

namespace Database\Seeders;

use App\Models\FeedItem;
use Illuminate\Database\Seeder;

class TodayFeedSeeder extends Seeder
{
    public function run(): void
    {
        // Feed items without tying to legacy Quarter
        FeedItem::query()->updateOrCreate(
            ['type' => 'quote', 'priority' => 10],
            [
                'quarter_id' => null,
                'payload' => [
                    'text' => 'Small steps, done daily, can carry you further than big promises.',
                    'author' => 'Today Feed',
                ],
                'visible_from' => null,
                'visible_until' => null,
            ],
        );

        FeedItem::query()->updateOrCreate(
            ['type' => 'reflection', 'priority' => 5],
            [
                'quarter_id' => null,
                'payload' => [
                    'prompt' => 'What is one thing you can release today so you can focus on what matters?',
                    'prompt_id' => 1,
                ],
                'visible_from' => null,
                'visible_until' => null,
            ],
        );

        FeedItem::query()->updateOrCreate(
            ['type' => 'community', 'priority' => 3],
            [
                'quarter_id' => null,
                'payload' => [
                    'title' => 'This week’s highlight: Prayer requests & support',
                    'count' => 24,
                    'ctaText' => 'Open discussion',
                ],
                'visible_from' => null,
                'visible_until' => null,
            ],
        );

        FeedItem::query()->updateOrCreate(
            ['type' => 'talk', 'priority' => 1],
            [
                'quarter_id' => null,
                'payload' => [
                    'title' => 'A short talk: How to build a steady spiritual rhythm',
                    'duration' => '6:12',
                    'thumbnailUrl' => null,
                    'ctaUrl' => 'https://example.com',
                ],
                'visible_from' => null,
                'visible_until' => null,
            ],
        );
    }
}
