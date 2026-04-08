<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Admin user (change later)
        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                // Keep existing password if user already exists.
                // If creating new, set a default password.
                'password' => User::query()->where('email', 'admin@example.com')->value('password')
                    ?? bcrypt('password'),
                'is_admin' => true,
                'is_it' => true,
            ],
        );

        // Seed 4 channels
        $channels = [
            [
                'slug' => 'sabbath-school',
                'title' => 'SabbathSchool',
                'description' => 'Pelajaran 1-13',
                'type' => 'sabbath_school',
            ],
            [
                'slug' => 'god-first',
                'title' => 'GodFirst',
                'description' => '(Sabtu)',
                'type' => 'weekly',
            ],
            [
                'slug' => 'faith-journey',
                'title' => 'FaithJourney',
                'description' => '(Sabtu)',
                'type' => 'weekly',
            ],
            [
                'slug' => 'family',
                'title' => 'Family',
                'description' => '(Minggu)',
                'type' => 'weekly',
            ],
        ];

        foreach ($channels as $data) {
            Channel::query()->updateOrCreate(['slug' => $data['slug']], $data);
        }

        // Seed Q1 2026 (start at Sat 2025-12-27)
        $q1Start = Carbon::parse('2025-12-27');
        $q1End = $q1Start->copy()->addDays(13 * 7 - 1);

        $q1 = SsQuarter::query()->updateOrCreate(
            ['year' => 2026, 'quarter' => 1],
            [
                'title' => 'Q1 2026',
                'start_date' => $q1Start->toDateString(),
                'end_date' => $q1End->toDateString(),
                'is_active' => true,
            ],
        );

        $dayKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

        // Ensure only one active quarter for 2026 in seed
        SsQuarter::query()
            ->where('id', '!=', $q1->id)
            ->where('year', 2026)
            ->update(['is_active' => false]);

        for ($lessonNumber = 1; $lessonNumber <= 13; $lessonNumber++) {
            $lessonStart = $q1Start->copy()->addDays(($lessonNumber - 1) * 7);
            $lessonEnd = $lessonStart->copy()->addDays(6);

            $lesson = SsLesson::query()->updateOrCreate(
                ['quarter_id' => $q1->id, 'lesson_number' => $lessonNumber],
                [
                    'title' => 'Lesson '.$lessonNumber,
                    'start_date' => $lessonStart->toDateString(),
                    'end_date' => $lessonEnd->toDateString(),
                ],
            );

            for ($dayIndex = 0; $dayIndex < 7; $dayIndex++) {
                $date = $lessonStart->copy()->addDays($dayIndex);
                SsDay::query()->updateOrCreate(
                    ['lesson_id' => $lesson->id, 'day_key' => $dayKeys[$dayIndex]],
                    [
                        'date' => $date->toDateString(),
                        'title' => null,
                        'content' => null,
                        'status' => 'draft',
                    ],
                );
            }
        }

        // Global app/site settings defaults (idempotent).
        $this->call(AppSettingsSeeder::class);
        $this->call([
            VerseThemeSeeder::class,
            VerseToneSeeder::class,
            VerseToneMappingSeeder::class,
            VersePastoralNotesSeeder::class,
        ]);
    }
}
