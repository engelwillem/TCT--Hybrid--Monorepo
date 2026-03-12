<?php

namespace Database\Seeders;

use App\Models\SsDay;
use App\Models\SsLesson;
use App\Models\SsQuarter;
use Illuminate\Database\Seeder;

class SabbathSchoolContentSeeder extends Seeder
{
    public function run(): void
    {
        $q1 = SsQuarter::query()
            ->where('year', 2026)
            ->where('quarter', 1)
            ->first();

        if (! $q1) {
            return;
        }

        $lesson1 = SsLesson::query()
            ->where('quarter_id', $q1->id)
            ->where('lesson_number', 1)
            ->first();

        if (! $lesson1) {
            return;
        }

        // Ensure at least 1 published day so /channels/sabbath-school has a valid "Continue reading".
        SsDay::query()
            ->where('lesson_id', $lesson1->id)
            ->where('day_key', 'sat')
            ->update([
                'title' => 'Lesson 1 (Preview)',
                'content' => '<p>Konten minimal untuk memastikan UI tidak kosong. (Seeder)</p>',
                'status' => 'published',
            ]);
    }
}
