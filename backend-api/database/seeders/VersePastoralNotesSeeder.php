<?php

namespace Database\Seeders;

use App\Models\VersePastoralNote;
use Illuminate\Database\Seeder;

class VersePastoralNotesSeeder extends Seeder
{
    public function run(): void
    {
        $notes = [
            [
                'verse_ref' => '1tes-5-18',
                'theme_slug' => 'gratitude',
                'tone_slug' => 'worshipful',
                'main_message' => 'Syukur menjaga hati tetap jernih melihat kebaikan Tuhan, bahkan di tengah ritme hidup yang naik turun.',
                'pastoral_angle' => 'Syukur bukan menutup mata terhadap kenyataan, tetapi memilih mengingat kesetiaan Tuhan setiap hari.',
                'application_text' => 'Rawat syukurmu dengan menyebut satu per satu kebaikan Tuhan hari ini, lalu responslah dengan hidup yang rendah hati.',
                'hope_text' => 'Hati yang bersyukur bertumbuh lebih stabil dan tidak mudah diguncang keadaan.',
                'prayer_direction' => 'Doakan: Tuhan, ajar aku tetap bersyukur dan peka melihat kebaikan-Mu.',
                'priority' => 108,
            ],
            [
                'verse_ref' => 'mzm-34-19',
                'theme_slug' => 'longing_family',
                'tone_slug' => 'tender',
                'main_message' => 'Kerinduan kepada keluarga adalah tanda kasih yang hidup, dan Tuhan hadir di tengah rasa itu.',
                'pastoral_angle' => 'Jarak tidak membatalkan penyertaan Tuhan atas orang-orang yang kita kasihi.',
                'application_text' => 'Alihkan kerinduan menjadi doa yang teratur, titipkan nama keluarga satu per satu kepada Tuhan.',
                'hope_text' => 'Tuhan menjaga kasih tetap hangat sambil menumbuhkan harapan untuk waktu perjumpaan yang tepat.',
                'prayer_direction' => 'Doakan perlindungan, kesehatan, dan damai Tuhan atas keluarga yang sedang berjauhan.',
                'priority' => 110,
            ],
            [
                'verse_ref' => 'flp-4-6',
                'theme_slug' => 'anxiety',
                'tone_slug' => 'comforting',
                'main_message' => 'Kecemasan tidak perlu dipendam sendiri; Tuhan membuka ruang doa yang menenangkan.',
                'pastoral_angle' => 'Doa adalah tempat hati yang cemas belajar bernapas dalam iman.',
                'application_text' => 'Pisahkan hal yang bisa kamu kerjakan hari ini dan hal yang perlu kamu serahkan kepada Tuhan.',
                'hope_text' => 'Damai Tuhan menata batinmu pelan-pelan, bahkan sebelum semua jawaban datang.',
                'prayer_direction' => 'Doakan: Tuhan, tenangkan pikiranku dan tuntun langkahku satu hari ini saja.',
                'priority' => 112,
            ],
            [
                'verse_ref' => 'mat-11-28',
                'theme_slug' => 'fatigue',
                'tone_slug' => 'restorative',
                'main_message' => 'Tuhan tidak menuntutmu memaksakan diri; Ia mengundangmu datang untuk dipulihkan.',
                'pastoral_angle' => 'Istirahat rohani adalah bagian dari ketaatan, bukan kelemahan.',
                'application_text' => 'Ambil jeda yang sehat, atur ulang ritme, dan minta Tuhan memberi kekuatan baru untuk langkah kecil berikutnya.',
                'hope_text' => 'Kelelahanmu bukan akhir cerita; Tuhan masih menopangmu dengan setia.',
                'prayer_direction' => 'Doakan pembaruan kekuatan tubuh, emosi, dan pikiran.',
                'priority' => 109,
            ],
            [
                'verse_ref' => '1yoh-1-9',
                'theme_slug' => 'guilt',
                'tone_slug' => 'restorative',
                'main_message' => 'Pengakuan yang jujur membuka jalan pengampunan dan pemulihan yang nyata.',
                'pastoral_angle' => 'Tuhan tidak menahan pengampunan bagi hati yang datang dengan pertobatan.',
                'application_text' => 'Akui dosamu dengan jujur, tinggalkan pola lama, lalu bangun langkah baru dalam terang.',
                'hope_text' => 'Masa depanmu tidak berhenti di kegagalan masa lalu.',
                'prayer_direction' => 'Doakan: Tuhan, ampuni aku, pulihkan aku, dan tuntun aku hidup benar.',
                'correction_direction' => 'Pemulihan sejati disertai keputusan nyata untuk meninggalkan dosa.',
                'priority' => 114,
            ],
            [
                'verse_ref' => 'ams-3-5',
                'theme_slug' => 'guidance',
                'tone_slug' => 'guiding',
                'main_message' => 'Ketika arah belum jelas, iman mengajar kita melangkah dengan percaya, bukan panik.',
                'pastoral_angle' => 'Hikmat Tuhan sering datang saat kita taat pada langkah sederhana yang sudah jelas.',
                'application_text' => 'Ambil keputusan kecil yang benar hari ini, sambil terus meminta hikmat Tuhan.',
                'hope_text' => 'Tuhan menuntunmu bukan sekaligus, melainkan setahap demi setahap.',
                'prayer_direction' => 'Doakan hikmat, kejernihan, dan hati yang taat.',
                'priority' => 107,
            ],
            [
                'verse_ref' => 'yak-1-19',
                'theme_slug' => 'anger_conflict',
                'tone_slug' => 'restraining',
                'main_message' => 'Kemarahan yang tidak ditata dapat melukai, tetapi Tuhan memanggilmu kembali pada kendali diri.',
                'pastoral_angle' => 'Jujur soal marah itu penting, namun respons kita tetap perlu dipimpin hikmat Tuhan.',
                'application_text' => 'Tunda reaksi spontan, tenangkan diri, lalu pilih kata yang membangun, bukan melukai.',
                'hope_text' => 'Saat hati diserahkan kepada Tuhan, kemarahan tidak lagi memimpin keputusanmu.',
                'prayer_direction' => 'Doakan: Tuhan, tahan lidahku, jernihkan pikiranku, dan penuhi hatiku dengan damai.',
                'correction_direction' => 'Hindari ucapan kasar atau balas dendam; itu tidak menghasilkan kebenaran.',
                'de_escalation_direction' => 'Jika emosi sedang tinggi, ambil jarak sehat sementara sebelum berbicara lagi.',
                'priority' => 125,
            ],
            [
                'verse_ref' => 'ef-4-29',
                'theme_slug' => 'hatred_hostility',
                'tone_slug' => 'restraining',
                'main_message' => 'Ucapan yang keluar dari mulut kita bisa merusak atau memulihkan; Tuhan memanggil kata-kata yang memberi hidup.',
                'pastoral_angle' => 'Kebencian tidak perlu dipelihara; Tuhan menuntun kita ke jalan damai dan pertobatan.',
                'application_text' => 'Sebelum berbicara, tanyakan: apakah ini membawa damai, kebenaran, dan manfaat?',
                'hope_text' => 'Tuhan sanggup melembutkan hati yang keras bila kita mau dituntun-Nya.',
                'prayer_direction' => 'Doakan hati yang lembut dan perkataan yang membawa berkat.',
                'correction_direction' => 'Tinggalkan dorongan untuk memaki atau merendahkan orang lain.',
                'de_escalation_direction' => 'Pilih menahan diri hari ini; damai lebih kuat daripada ledakan emosi sesaat.',
                'priority' => 123,
            ],
        ];

        foreach ($notes as $note) {
            VersePastoralNote::updateOrCreate(
                [
                    'verse_ref' => $note['verse_ref'],
                    'lang' => 'id',
                    'theme_slug' => $note['theme_slug'],
                ],
                array_merge($note, [
                    'audience_scope' => 'all',
                    'language_style' => 'plain',
                    'is_active' => true,
                ])
            );
        }
    }
}

