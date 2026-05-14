<?php

namespace Database\Seeders;

use App\Models\MemberPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class MemberPostSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Editorial Users Exist
        $editor = User::firstOrCreate(
            ['email' => 'editor@thechoosentalks.com'],
            ['name' => 'The Shepherd', 'password' => bcrypt('password'), 'is_admin' => true]
        );

        $encourager = User::firstOrCreate(
            ['email' => 'encourager@thechoosentalks.com'],
            ['name' => 'The Encourager', 'password' => bcrypt('password')]
        );

        $now = Carbon::now();

        // 2. Seed Initial Prayer Requests (Seeded Content)
        $prayers = [
            ['text' => 'Mohon dukungan doa untuk kesembuhan orang tua saya yang sedang di rumah sakit.', 'user' => $encourager],
            ['text' => 'Doakan supaya saya bisa tetap setia dan tekun dalam studi saya.', 'user' => $encourager],
            ['text' => 'Tolong doakan pergumulan pekerjaan saya ke depan agar sesuai dengan kehendak-Nya.', 'user' => $encourager],
            ['text' => 'Mohon doa untuk kedamaian hati dalam menghadapi ujian kehidupan minggu ini.', 'user' => $encourager],
        ];

        foreach ($prayers as $data) {
            MemberPost::create([
                'user_id' => $data['user']->id,
                'type' => 'prayer_request',
                'text' => $data['text'],
                'expires_at' => $now->copy()->addDays(rand(3, 10)),
            ]);
        }

        // 3. Seed Initial Testimonies
        $testimonies = [
            'Puji Tuhan, hari ini saya melihat kebaikan Tuhan yang luar biasa melalui bantuan teman yang tidak disangka.',
            'Terima kasih Tuhan untuk kekuatan yang Engkau berikan melewati minggu yang berat ini.',
            'Hari ini terjawab sebuah doa yang sudah saya naikkan selama 3 bulan. Tuhan sungguh baik!',
        ];

        foreach ($testimonies as $text) {
            MemberPost::create([
                'user_id' => $editor->id,
                'type' => 'testimony',
                'text' => $text,
                'title' => 'Kebaikan Tuhan',
                'expires_at' => $now->copy()->addDays(30),
            ]);
        }

        // 4. Seed Seeded Reflections
        $reflections = [
            'Merenungkan Mazmur 23 hari ini, sungguh menenangkan mengetahui Tuhan adalah Gembala yang baik.',
            'Filipi 4:13 mengingatkan saya bahwa di dalam Dia saya bisa melewati segalanya. Semangat buat teman-teman!',
        ];

        foreach ($reflections as $text) {
            MemberPost::create([
                'user_id' => $editor->id,
                'type' => 'reflection',
                'text' => $text,
                'expires_at' => $now->copy()->addDays(14),
            ]);
        }
    }
}
