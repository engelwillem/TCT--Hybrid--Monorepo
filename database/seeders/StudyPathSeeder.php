<?php

namespace Database\Seeders;

use App\Models\StudyPath;
use App\Models\StudyPathStep;
use Illuminate\Database\Seeder;

class StudyPathSeeder extends Seeder
{
    public function run(): void
    {
        $paths = [
            [
                'slug' => 'dasar-iman',
                'title_id' => 'Dasar Iman Kristen',
                'title_en' => 'Foundations of the Christian Faith',
                'description_id' => 'Pelajari pilar-pilar utama iman Kristen melalui ayat-ayat kunci.',
                'description_en' => 'Learn the key pillars of the Christian faith through essential verses.',
                'cover_color' => 'amber',
                'difficulty' => 'beginner',
                'estimated_minutes' => 30,
                'steps' => [
                    ['verse_ref' => 'kej-1-1', 'focus_question' => 'Apa yang diajarkan ayat ini tentang asal usul alam semesta?'],
                    ['verse_ref' => 'yoh-3-16', 'focus_question' => 'Bagaimana kasih Allah dinyatakan kepada dunia?'],
                    ['verse_ref' => 'ef-2-8', 'focus_question' => 'Apa peran iman vs perbuatan dalam keselamatan?'],
                    ['verse_ref' => 'rom-10-9', 'focus_question' => 'Bagaimana seseorang menerima keselamatan?'],
                ],
            ],
            [
                'slug' => 'mengenal-yesus',
                'title_id' => 'Mengenal Yesus Kristus',
                'title_en' => 'Knowing Jesus Christ',
                'description_id' => 'Siapakah Yesus sebenarnya? Temukan identitas-Nya melalui Alkitab.',
                'description_en' => 'Who is Jesus really? Discover His identity through the Scriptures.',
                'cover_color' => 'sky',
                'difficulty' => 'beginner',
                'estimated_minutes' => 45,
                'steps' => [
                    ['verse_ref' => 'yoh-1-1', 'focus_question' => 'Siapakah "Firman" yang dimaksud di sini?'],
                    ['verse_ref' => 'yoh-14-6', 'focus_question' => 'Apa klaim eksklusif Yesus tentang diri-Nya?'],
                    ['verse_ref' => 'flp-2-7', 'focus_question' => 'Bagaimana Yesus menunjukkan kerendahan hati-Nya?'],
                    ['verse_ref' => '1kor-15-3', 'focus_question' => 'Apa inti dari Injil yang diberitakan Paulus?'],
                ],
            ],
            [
                'slug' => 'mengatasi-kecemasan',
                'title_id' => 'Mengatasi Kecemasan',
                'title_en' => 'Overcoming Anxiety',
                'description_id' => 'Temukan ketenangan di tengah badai melalui janji-janji Allah.',
                'description_en' => 'Find peace in the midst of the storm through God\'s promises.',
                'cover_color' => 'green',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 20,
                'steps' => [
                    ['verse_ref' => 'mzm-23-1', 'focus_question' => 'Bagaimana Allah digambarkan sebagai gembala dalam situasi sulit?'],
                    ['verse_ref' => 'yes-41-10', 'focus_question' => 'Mengapa kita tidak perlu takut menurut ayat ini?'],
                    ['verse_ref' => 'flp-4-6', 'focus_question' => 'Apa alternatif dari kekhawatiran yang disarankan Paulus?'],
                    ['verse_ref' => 'mat-6-34', 'focus_question' => 'Mengapa Yesus menyarankan kita tidak khawatir akan hari esok?'],
                ],
            ],
        ];

        foreach ($paths as $pathData) {
            $steps = $pathData['steps'];
            unset($pathData['steps']);

            $path = StudyPath::updateOrCreate(
                ['slug' => $pathData['slug']],
                array_merge($pathData, ['is_published' => true])
            );

            foreach ($steps as $index => $stepData) {
                StudyPathStep::updateOrCreate(
                    [
                        'path_id' => $path->id,
                        'verse_ref' => $stepData['verse_ref']
                    ],
                    [
                        'step_order' => $index + 1,
                        'focus_question' => $stepData['focus_question'],
                        'mentor_note' => 'Gunakan tab "Refleksi" dan "Ask" jika Anda memiliki pertanyaan lebih lanjut.',
                    ]
                );
            }
        }
    }
}
