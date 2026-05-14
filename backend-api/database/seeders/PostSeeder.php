<?php

namespace Database\Seeders;

use App\Enums\PostType;
use App\Enums\ReactionType;
use App\Models\MemberPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $editor = User::where('email', 'editor@thechoosentalks.com')->first();
        $now = Carbon::now();

        // 1. Seed Reflections (from Editor)
        $reflections = [
            [
                'text' => 'Merenungkan Mazmur 23:1 hari ini. "TUHAN adalah gembalaku, takkan kekurangan aku." Sungguh menenangkan hati.',
                'metadata' => ['verse_ref' => 'Mazmur 23:1'],
                'title' => 'Ketenangan Hati',
            ],
            [
                'text' => 'Kebaikan Tuhan nyata dalam setiap tarikan nafas kita. Jangan lupa untuk bersyukur hari ini!',
                'metadata' => ['verse_ref' => '1 Tesalonika 5:18'],
                'title' => 'Syukur Harian',
            ],
            [
                'text' => 'Seringkali kita terlalu sibuk melihat apa yang belum ada, sampai lupa mensyukuri apa yang sudah Tuhan beri.',
                'metadata' => ['verse_ref' => 'Filipi 4:6'],
                'title' => 'Fokus pada Berkat',
            ],
            [
                'text' => 'Kekuatan kita terbatas, tapi anugerah-Nya melimpah. Biarlah Tuhan yang memegang kendali atas hari ini.',
                'metadata' => ['verse_ref' => '2 Korintus 12:9'],
                'title' => 'Anugerah Melimpah',
            ],
        ];

        foreach ($reflections as $data) {
            MemberPost::updateOrCreate(
                ['text' => $data['text'], 'user_id' => $editor->id],
                [
                    'type' => PostType::REFLECTION,
                    'title' => $data['title'],
                    'metadata' => $data['metadata'],
                    'created_at' => $now->copy()->subHours(rand(1, 48)),
                ]
            );
        }

        // 2. Seed Prayer Requests (Urgent)
        $prayers = [
            'Mohon dukungan doa untuk kesembuhan adik saya yang sedang demam tinggi.',
            'Teman-teman, minta tolong doakan pergumulan pekerjaan saya minggu ini ya.',
            'Doakan supaya keluarga kami tetap rukun dan takut akan Tuhan.',
            'Minta dukungan doa untuk keberangkatan misi tim pemuda ke desa terpencil besok.',
            'Doakan kesehatan orang tua saya yang sedang dalam masa pemulihan pasca operasi.',
        ];

        foreach ($prayers as $text) {
            MemberPost::updateOrCreate(
                ['text' => $text],
                [
                    'user_id' => $users->random()->id,
                    'type' => PostType::PRAYER_REQUEST,
                    'expires_at' => $now->copy()->addDays(7),
                    'created_at' => $now->copy()->subHours(rand(1, 24)),
                ]
            );
        }

        // 3. Seed Testimonies
        $testimonies = [
            'Luar biasa! Hari ini saya melihat pintu yang tertutup selama 1 tahun akhirnya dibuka oleh Tuhan.',
            'Terima kasih buat doa teman-teman, hasil Lab saya menyatakan saya sudah sembuh total!',
            'Hari ini saya belajar bahwa waktu Tuhan adalah yang terbaik, meskipun awalnya terasa sulit.',
        ];

        foreach ($testimonies as $text) {
            MemberPost::updateOrCreate(
                ['text' => $text],
                [
                    'user_id' => $users->random()->id,
                    'type' => PostType::TESTIMONY,
                    'title' => 'Kesaksian',
                    'created_at' => $now->copy()->subDays(rand(1, 5)),
                ]
            );
        }

        // 4. Seed Random Reactions to make it feel "Alive"
        MemberPost::all()->each(function ($post) use ($users) {
            $reactors = $users->random(rand(2, 5));
            foreach ($reactors as $user) {
                if ($user->id !== $post->user_id) {
                    $post->reactions()->create([
                        'user_id' => $user->id,
                        'type' => ReactionType::AMEN,
                    ]);
                }
            }
        });
    }
}
