<?php

namespace Database\Seeders;

use App\Models\VerseTone;
use Illuminate\Database\Seeder;

class VerseToneSeeder extends Seeder
{
    public function run(): void
    {
        $tones = [
            ['slug' => 'comforting', 'title_id' => 'Menghibur', 'title_en' => 'Comforting', 'description_id' => 'Meneguhkan hati yang takut atau sedih.', 'description_en' => 'Steadies a fearful or sad heart.'],
            ['slug' => 'tender', 'title_id' => 'Lembut', 'title_en' => 'Tender', 'description_id' => 'Bahasa empatik untuk hati yang rapuh atau merindu.', 'description_en' => 'Empathetic language for fragile or longing hearts.'],
            ['slug' => 'reassuring', 'title_id' => 'Menenangkan', 'title_en' => 'Reassuring', 'description_id' => 'Menguatkan keyakinan bahwa Tuhan tetap memegang keadaan.', 'description_en' => 'Builds confidence that God remains in control.'],
            ['slug' => 'restorative', 'title_id' => 'Memulihkan', 'title_en' => 'Restorative', 'description_id' => 'Mengarah pada pemulihan, pengampunan, dan pertumbuhan baru.', 'description_en' => 'Leads toward healing, forgiveness, and renewed growth.'],
            ['slug' => 'corrective', 'title_id' => 'Korektif', 'title_en' => 'Corrective', 'description_id' => 'Menegur dengan kasih agar kembali ke jalan yang benar.', 'description_en' => 'Loving correction toward godly direction.'],
            ['slug' => 'worshipful', 'title_id' => 'Penyembahan', 'title_en' => 'Worshipful', 'description_id' => 'Mengangkat hati pada syukur dan penyembahan.', 'description_en' => 'Lifts the heart into gratitude and worship.'],
            ['slug' => 'guiding', 'title_id' => 'Menuntun', 'title_en' => 'Guiding', 'description_id' => 'Memberi arah bijak untuk langkah berikutnya.', 'description_en' => 'Offers wise direction for next steps.'],
            ['slug' => 'restraining', 'title_id' => 'Menahan Diri', 'title_en' => 'Restraining', 'description_id' => 'Mendorong kendali diri, damai, dan meredakan konflik.', 'description_en' => 'Encourages self-control, peace, and de-escalation.'],
        ];

        foreach ($tones as $index => $tone) {
            VerseTone::updateOrCreate(
                ['slug' => $tone['slug']],
                array_merge($tone, [
                    'is_published' => true,
                    'sort_order' => $index + 1,
                ])
            );
        }
    }
}

