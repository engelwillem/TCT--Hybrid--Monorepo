<?php

namespace Database\Seeders;

use App\Enums\DailyContentType;
use App\Models\DailyContent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DailyContentSeeder extends Seeder
{
    public function run(): void
    {
        $startDate = Carbon::today();

        for ($i = 0; $i < 14; $i++) {
            $currentDate = $startDate->copy()->addDays($i);
            $dateStr = $currentDate->toDateString();

            // 1. Today's Verse
            DailyContent::updateOrCreate(
                ['date' => $dateStr, 'content_type' => DailyContentType::TODAY_VERSE],
                [
                    'payload' => [
                        'reference' => 'Yeremia 29:11',
                        'text' => 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN.',
                        'author' => 'Nabi Yeremia',
                    ],
                    'published_at' => $currentDate->startOfDay(),
                ]
            );

            // 2. Quote of the Day
            DailyContent::updateOrCreate(
                ['date' => $dateStr, 'content_type' => DailyContentType::QUOTE_OF_DAY],
                [
                    'payload' => [
                        'text' => 'Bekerjalah seolah semuanya bergantung padamu, berdoalah seolah semuanya bergantung pada Allah.',
                        'author' => 'Augustine',
                    ],
                    'published_at' => $currentDate->startOfDay(),
                ]
            );

            // 3. Reflection Prompt
            DailyContent::updateOrCreate(
                ['date' => $dateStr, 'content_type' => DailyContentType::REFLECTION_PROMPT],
                [
                    'payload' => [
                        'question' => 'Apa satu hal yang paling kamu syukuri dari penyertaan Tuhan hari ini?',
                        'context' => 'Gratitude',
                    ],
                    'published_at' => $currentDate->startOfDay(),
                ]
            );

            // 4. Prayer Prompt
            DailyContent::updateOrCreate(
                ['date' => $dateStr, 'content_type' => DailyContentType::PRAYER_PROMPT],
                [
                    'payload' => [
                        'target' => 'Misionaris kita di pedalaman',
                        'theme' => 'Kekuatan dan Perlindungan',
                    ],
                    'published_at' => $currentDate->startOfDay(),
                ]
            );
        }
    }
}
