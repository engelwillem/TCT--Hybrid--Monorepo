<?php

namespace Database\Seeders;

use App\Models\DailyContent;
use App\Models\MemberPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EngagementEngineSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@thechoosentalks.com'],
            ['name' => 'TCT Team', 'password' => bcrypt('password'), 'is_admin' => true]
        );

        $users = User::factory()->count(5)->create();

        $startDate = Carbon::today();

        for ($i = 0; $i < 14; $i++) {
            $date = $startDate->copy()->addDays($i);

            // 1. Daily Verse
            DailyContent::updateOrCreate(
                ['date' => $date->toDateString(), 'content_type' => 'today_verse'],
                [
                    'payload' => [
                        'reference' => 'Yeremia 29:11',
                        'text' => 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.',
                        'author' => 'Nabi Yeremia',
                        'image' => null,
                        'cta_label' => 'Baca Selengkapnya',
                        'cta_href' => '/versehub/id',
                    ],
                    'published_at' => $date->startOfDay(),
                ]
            );

            // 2. Quote of Day
            DailyContent::updateOrCreate(
                ['date' => $date->toDateString(), 'content_type' => 'quote_of_day'],
                [
                    'payload' => [
                        'text' => 'Iman bukan berarti percaya bahwa Allah bisa melakukannya, tetapi percaya bahwa Dia akan melakukannya.',
                        'author' => 'Ellen G. White',
                    ],
                    'published_at' => $date->startOfDay(),
                ]
            );

            // 3. Reflection Prompt
            DailyContent::updateOrCreate(
                ['date' => $date->toDateString(), 'content_type' => 'reflection_prompt'],
                [
                    'payload' => [
                        'question' => 'Apa satu hal kecil hari ini yang membuatmu merasa sangat dikasihi oleh-Nya?',
                        'response_count' => rand(10, 50),
                    ],
                    'published_at' => $date->startOfDay(),
                ]
            );
        }

        // Seed Hybrid Feed Items
        foreach ($users as $user) {
            // Member Post
            MemberPost::create([
                'user_id' => $user->id,
                'type' => 'user_post',
                'text' => 'Hari ini saya sangat bersyukur bisa berkumpul kembali dengan keluarga. Tuhan baik!',
                'created_at' => now()->subHours(rand(1, 24)),
                'expires_at' => now()->addHours(24),
            ]);

            // Prayer Request
            MemberPost::create([
                'user_id' => $user->id,
                'type' => 'prayer_request',
                'title' => 'Mohon dukungan doa untuk kesembuhan Ibu saya',
                'text' => 'Beliau sedang dirawat di RS karena DBD. Percaya kuasa kesembuhan-Nya nyata.',
                'metadata' => ['pray_count' => rand(5, 20)],
                'created_at' => now()->subHours(rand(1, 24)),
                'expires_at' => now()->addDays(7),
            ]);

            // Reflection
            MemberPost::create([
                'user_id' => $user->id,
                'type' => 'reflection',
                'title' => 'Renungan Yeremia 29:11',
                'text' => 'Masa depan saya ada di tangan yang tepat. Tidak perlu khawatir lagi.',
                'created_at' => now()->subHours(rand(1, 24)),
                'expires_at' => now()->addHours(48),
            ]);
        }
    }
}
