<?php

namespace Database\Seeders;

use App\Models\VerseTheme;
use App\Models\VerseThemeMapping;
use Illuminate\Database\Seeder;

class VerseThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            [
                'slug' => 'kasih-karunia',
                'title_id' => 'Kasih Karunia',
                'title_en' => 'Grace',
                'description_id' => 'Kebaikan Allah yang tidak layak kita terima, diberikan secara cuma-cuma.',
                'description_en' => 'The unmerited favor of God, freely given to humanity.',
                'color_key' => 'amber',
                'sort_order' => 1,
                'verses' => ['ef-2-8', 'yoh-1-17', 'rom-5-2', 'tit-2-11', '2kor-12-9'],
            ],
            [
                'slug' => 'iman',
                'title_id' => 'Iman',
                'title_en' => 'Faith',
                'description_id' => 'Keyakinan dan kepercayaan yang mendasari kehidupan Kristen.',
                'description_en' => 'The conviction and trust that underlies Christian life.',
                'color_key' => 'sky',
                'sort_order' => 2,
                'verses' => ['ibr-11-1', 'rom-1-17', 'yak-2-17', 'mrk-11-22', 'gal-2-20'],
            ],
            [
                'slug' => 'pengampunan',
                'title_id' => 'Pengampunan',
                'title_en' => 'Forgiveness',
                'description_id' => 'Allah yang mengampuni dan memanggil kita untuk saling mengampuni.',
                'description_en' => 'God who forgives, and the call to extend forgiveness to others.',
                'color_key' => 'rose',
                'sort_order' => 3,
                'verses' => ['mzm-51-1', 'luk-15-20', '1yoh-1-9', 'mat-6-14', 'ef-4-32'],
            ],
            [
                'slug' => 'kerajaan-allah',
                'title_id' => 'Kerajaan Allah',
                'title_en' => 'Kingdom of God',
                'description_id' => 'Pemerintahan Allah yang hadir kini dan masih akan datang sepenuhnya.',
                'description_en' => 'The reign of God, present now and coming in fullness.',
                'color_key' => 'violet',
                'sort_order' => 4,
                'verses' => ['mat-6-10', 'luk-17-21', 'mrk-1-15', 'why-11-15', 'rom-14-17'],
            ],
            [
                'slug' => 'damai',
                'title_id' => 'Damai Sejahtera',
                'title_en' => 'Peace (Shalom)',
                'description_id' => 'Shalom — keutuhan, ketenangan, dan rekonsiliasi dengan Allah dan sesama.',
                'description_en' => 'Shalom — wholeness, rest, and reconciliation with God and others.',
                'color_key' => 'green',
                'sort_order' => 5,
                'verses' => ['yoh-14-27', 'flp-4-7', 'yes-26-3', 'rom-5-1', 'kol-3-15'],
            ],
            [
                'slug' => 'kasih',
                'title_id' => 'Kasih (Agape)',
                'title_en' => 'Love (Agape)',
                'description_id' => 'Kasih tanpa syarat yang menjadi inti karakter Allah dan panggilan umat-Nya.',
                'description_en' => 'Unconditional love at the heart of God\'s character and our calling.',
                'color_key' => 'rose',
                'sort_order' => 6,
                'verses' => ['yoh-3-16', '1kor-13-4', '1yoh-4-8', 'rom-8-38', 'yoh-15-13'],
            ],
            [
                'slug' => 'harapan',
                'title_id' => 'Harapan',
                'title_en' => 'Hope',
                'description_id' => 'Keyakinan yang berakar pada janji Allah tentang masa depan.',
                'description_en' => 'Confident expectation rooted in God\'s promises for the future.',
                'color_key' => 'sky',
                'sort_order' => 7,
                'verses' => ['rom-8-24', 'ibr-6-19', 'why-21-4', 'mzm-39-7', 'yer-29-11'],
            ],
            [
                'slug' => 'takut-akan-tuhan',
                'title_id' => 'Takut akan Tuhan',
                'title_en' => 'Fear of the Lord',
                'description_id' => 'Kekaguman dan penghormatan mendalam kepada Allah, sumber hikmat sejati.',
                'description_en' => 'Reverent awe before God — the beginning of true wisdom.',
                'color_key' => 'amber',
                'sort_order' => 8,
                'verses' => ['ams-1-7', 'mzm-111-10', 'yes-11-2', 'pkh-12-13', 'luk-1-50'],
            ],
            [
                'slug' => 'penderitaan',
                'title_id' => 'Penderitaan dan Ketahanan',
                'title_en' => 'Suffering and Perseverance',
                'description_id' => 'Bagaimana Alkitab berbicara jujur tentang penderitaan dan ketahanan iman.',
                'description_en' => 'How the Bible speaks honestly about suffering and enduring faith.',
                'color_key' => 'slate',
                'sort_order' => 9,
                'verses' => ['rom-5-3', 'yak-1-2', '2kor-4-17', 'mzm-22-1', '1ptr-4-12'],
            ],
            [
                'slug' => 'keadilan',
                'title_id' => 'Keadilan',
                'title_en' => 'Justice',
                'description_id' => 'Panggilan Allah untuk menegakkan keadilan, membela yang lemah dan tertindas.',
                'description_en' => 'God\'s call to pursue justice and defend the vulnerable.',
                'color_key' => 'violet',
                'sort_order' => 10,
                'verses' => ['mik-6-8', 'yes-1-17', 'ams-31-9', 'luk-4-18', 'mat-25-40'],
            ],
            [
                'slug' => 'perjanjian',
                'title_id' => 'Perjanjian Allah',
                'title_en' => 'Covenant',
                'description_id' => 'Ikatan perjanjian Allah dengan umat-Nya — dari Abraham hingga Kristus.',
                'description_en' => 'God\'s covenant bond with humanity — from Abraham to Christ.',
                'color_key' => 'amber',
                'sort_order' => 11,
                'verses' => ['kej-12-3', 'kel-19-5', 'yer-31-31', 'luk-22-20', 'ibr-8-6'],
            ],
            [
                'slug' => 'doa',
                'title_id' => 'Doa',
                'title_en' => 'Prayer',
                'description_id' => 'Percakapan dengan Allah — dari pujian hingga ratapan dan permohonan.',
                'description_en' => 'Conversation with God — from praise to lament to petition.',
                'color_key' => 'sky',
                'sort_order' => 12,
                'verses' => ['mat-6-9', 'flp-4-6', 'mzm-46-1', 'yak-5-16', 'luk-11-1'],
            ],
            [
                'slug' => 'keselamatan',
                'title_id' => 'Keselamatan',
                'title_en' => 'Salvation',
                'description_id' => 'Karya penyelamatan Allah yang membebaskan manusia dari dosa dan kematian.',
                'description_en' => 'God\'s saving work that frees humanity from sin and death.',
                'color_key' => 'green',
                'sort_order' => 13,
                'verses' => ['ef-2-8', 'rom-10-9', 'yoh-3-16', 'kis-4-12', 'luk-19-10'],
            ],
            [
                'slug' => 'identitas-dalam-kristus',
                'title_id' => 'Identitas dalam Kristus',
                'title_en' => 'Identity in Christ',
                'description_id' => 'Siapa kita sesungguhnya karena hubungan kita dengan Kristus.',
                'description_en' => 'Who we truly are because of our union with Christ.',
                'color_key' => 'rose',
                'sort_order' => 14,
                'verses' => ['gal-2-20', '2kor-5-17', 'kol-3-3', 'yoh-1-12', 'rom-8-1'],
            ],
            [
                'slug' => 'pemuridan',
                'title_id' => 'Pemuridan',
                'title_en' => 'Discipleship',
                'description_id' => 'Mengikut Yesus dan bertumbuh menjadi serupa dengan-Nya.',
                'description_en' => 'Following Jesus and growing into his likeness.',
                'color_key' => 'amber',
                'sort_order' => 15,
                'verses' => ['mat-16-24', 'luk-14-27', 'yoh-8-31', 'mrk-8-34', 'rom-12-1'],
            ],
            [
                'slug' => 'roh-kudus',
                'title_id' => 'Roh Kudus',
                'title_en' => 'Holy Spirit',
                'description_id' => 'Kehadiran dan karya Roh Kudus dalam kehidupan percaya.',
                'description_en' => 'The presence and work of the Holy Spirit in the life of faith.',
                'color_key' => 'sky',
                'sort_order' => 16,
                'verses' => ['yoh-14-26', 'gal-5-22', 'kis-2-4', 'rom-8-26', 'ef-5-18'],
            ],
            [
                'slug' => 'penciptaan',
                'title_id' => 'Penciptaan dan Pemeliharaan',
                'title_en' => 'Creation and Providence',
                'description_id' => 'Allah pencipta yang terus memelihara dan memimpin ciptaan-Nya.',
                'description_en' => 'God the creator who continually sustains and guides creation.',
                'color_key' => 'green',
                'sort_order' => 17,
                'verses' => ['kej-1-1', 'mzm-24-1', 'kol-1-16', 'ibr-1-3', 'why-4-11'],
            ],
            [
                'slug' => 'kebangkitan',
                'title_id' => 'Kebangkitan dan Kehidupan Kekal',
                'title_en' => 'Resurrection and Eternal Life',
                'description_id' => 'Kebangkitan Kristus sebagai pusat iman dan janji kehidupan kekal.',
                'description_en' => 'The resurrection of Christ as center of faith and promise of eternal life.',
                'color_key' => 'violet',
                'sort_order' => 18,
                'verses' => ['1kor-15-20', 'yoh-11-25', 'rom-6-4', 'why-20-6', 'flp-3-10'],
            ],
            [
                'slug' => 'hikmat',
                'title_id' => 'Hikmat',
                'title_en' => 'Wisdom',
                'description_id' => 'Hikmat ilahi yang melampaui pengetahuan duniawi.',
                'description_en' => 'Divine wisdom that surpasses worldly knowledge.',
                'color_key' => 'amber',
                'sort_order' => 19,
                'verses' => ['ams-3-5', 'yak-1-5', '1kor-1-25', 'pkh-1-2', 'kol-2-3'],
            ],
            [
                'slug' => 'rekonsiliasi',
                'title_id' => 'Rekonsiliasi',
                'title_en' => 'Reconciliation',
                'description_id' => 'Dipulihkan kepada hubungan yang benar dengan Allah dan sesama.',
                'description_en' => 'Restored to right relationship with God and one another.',
                'color_key' => 'rose',
                'sort_order' => 20,
                'verses' => ['2kor-5-18', 'rom-5-10', 'ef-2-16', 'kol-1-20', 'mat-5-24'],
            ],
        ];

        foreach ($themes as $themeData) {
            $verses = $themeData['verses'];
            unset($themeData['verses']);

            $theme = VerseTheme::updateOrCreate(
                ['slug' => $themeData['slug']],
                array_merge($themeData, ['is_published' => true])
            );

            foreach ($verses as $i => $verseRef) {
                VerseThemeMapping::updateOrCreate(
                    ['theme_slug' => $theme->slug, 'verse_ref' => $verseRef, 'lang' => 'id'],
                    ['sort_order' => $i]
                );
            }
        }
    }
}
