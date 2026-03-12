<?php

namespace App\Services\Mentor;

/**
 * Template-based Mentor Driver.
 *
 * Provides curated, structured responses without any external API calls.
 * This is the default driver. Swap to OpenAIMentorDriver or ClaudeMentorDriver
 * via config/versehub_mentor.php when ready.
 */
class TemplateMentorDriver implements MentorDriverInterface
{
    public function getInsights(
        string $bookCode,
        int $chapter,
        int $verse,
        string $text = ''
    ): array {
        $ref = "{$bookCode} {$chapter}:{$verse}";

        return [
            'reflection_questions' => $this->reflectionQuestions($bookCode, $chapter, $verse, $text),
            'theme_connections' => $this->themeConnections($bookCode, $chapter, $verse),
            'historical_context' => $this->historicalContext($bookCode),
        ];
    }

    public function answerQuestion(string $question, array $verseContext): array
    {
        $ref = $verseContext['ref'] ?? 'ayat ini';
        $book = $verseContext['book'] ?? '';
        $text = $verseContext['text'] ?? '';

        // Keyword-based thematic routing.
        $q = mb_strtolower($question);

        if ($this->contains($q, ['artinya', 'maksudnya', 'meaning', 'what does', 'apa artinya'])) {
            return [
                'answer' => "Ayat {$ref} berbicara tentang hal yang sangat mendalam. Perhatikan konteks kalimat sebelum dan sesudahnya — penulis sedang menyampaikan sesuatu kepada komunitas iman mereka yang spesifik.",
                'interpretation' => "Teks ini sering dipahami sebagai ungkapan syukur atau pengakuan akan kedaulatan Allah dalam situasi yang kompleks.",
                'study_guidance' => "Apa elemen dalam teks ini yang paling menarik perhatianmu? Cobalah bandingkan dengan perikop paralel di kitab lainnya.",
                'related_refs' => $this->siblingRefs($book, $verseContext['chapter'] ?? 1),
                'confidence' => 'interpretive',
            ];
        }

        if ($this->contains($q, ['pertobatan', 'tobat', 'repentance', 'forgive', 'ampun', 'pengampunan'])) {
            return [
                'answer' => "Tema pengampunan dan pertobatan adalah salah satu benang merah terkuat di seluruh Alkitab — dari Mazmur 51 hingga Lukas 15. Ayat ini mungkin menyentuh salah satu sisinya. Apa kata-kata spesifik dalam teks yang membuatmu berpikir tentang hal ini?",
                'related_refs' => ['mzm-51-1', 'luk-15-20', '1yoh-1-9'],
                'confidence' => 'scripture_based',
            ];
        }

        if ($this->contains($q, ['takut', 'fear', 'khawatir', 'anxiety', 'cemas'])) {
            return [
                'answer' => "Alkitab berbicara banyak tentang rasa takut — ada 'takut kepada Tuhan' yang positif, dan ada ketakutan manusiawi yang sering ditangani dengan empati besar. Lihat konteks penuh ayat ini untuk menemukan mana yang sedang dibicarakan.",
                'related_refs' => ['mzm-23-4', 'yoh-14-27', 'flp-4-6'],
                'confidence' => 'scripture_based',
            ];
        }

        if ($this->contains($q, ['kasih', 'love', 'cinta', 'agape'])) {
            return [
                'answer' => "Kata 'kasih' dalam konteks ini kemungkinan mengacu pada agape — kasih tanpa syarat yang menjadi ciri khas teologi Perjanjian Baru. Bandingkan dengan bagaimana kata ini digunakan di {$ref} dengan 1 Korintus 13.",
                'related_refs' => ['1kor-13-4', 'yoh-3-16', 'rom-8-38'],
                'confidence' => 'scripture_based',
            ];
        }

        // Default: thoughtful open response.
        return [
            'answer' => "Pertanyaan yang bagus tentang {$ref}. Teks ini memiliki lapisan makna yang perlu dieksplorasi dalam konteksnya. Cobalah baca beberapa ayat di atas dan bawahnya — konteks sering memberikan jawaban yang lebih jelas dari interpretasi yang terisolasi.",
            'related_refs' => $this->siblingRefs($book, $verseContext['chapter'] ?? 1),
            'confidence' => 'interpretive',
        ];
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function reflectionQuestions(string $book, int $chapter, int $verse, string $text): array
    {
        $genre = $this->genreFor($book);

        $byGenre = [
            'epistle' => [
                "Apa perintah atau prinsip konkret yang disampaikan penulis dalam ayat ini?",
                "Kepada siapa aslinya ayat ini ditulis, dan bagaimana konteks mereka membentuk pesannya?",
                "Bagaimana kebenaran ini bisa diterapkan dalam kehidupan sehari-hari, bukan hanya sebagai konsep?",
            ],
            'gospel' => [
                "Siapa yang Yesus sedang berbicara kepada dalam bagian ini, dan apa latar belakang mereka?",
                "Apa yang mungkin mengejutkan pendengar asli tentang apa yang Yesus katakan di sini?",
                "Apa respons yang dituntut oleh pengajaran ini?",
            ],
            'psalm' => [
                "Emosi apa yang diungkapkan dalam ayat ini — dan apakah itu jujur kepada Allah?",
                "Apakah ini ratapan, pujian, atau sesuatu yang lain? Apa perbedaannya bagi cara membacanya?",
                "Bagaimana doa-doa jujur seperti ini membentuk kehidupan rohanimu?",
            ],
            'prophecy' => [
                "Kepada siapa nubuatan ini pertama kali disampaikan, dan apa krisis yang sedang mereka hadapi?",
                "Apakah ada penggenapan historis yang jelas, atau ini masih berbicara tentang masa depan?",
                "Bagaimana memahami konteks aslinya mengubah cara kamu membaca teks ini?",
            ],
            'narrative' => [
                "Karakter siapa yang paling menonjol di sini, dan apa yang bisa dipelajari dari pilihan mereka?",
                "Apa tekanan atau konflik yang sedang terjadi dalam narasi ini?",
                "Bagaimana cerita ini menggambarkan karakter Allah tanpa harus menyatakannya secara langsung?",
            ],
        ];

        return $byGenre[$genre] ?? [
            "Apa kata atau frasa yang paling menonjol bagimu dalam ayat ini?",
            "Bagaimana ayat ini berkaitan dengan perikop di sekitarnya?",
            "Jika harus menjelaskan inti ayat ini kepada seseorang dalam satu kalimat, apa yang akan kamu katakan?",
        ];
    }

    private function themeConnections(string $book, int $chapter, int $verse): array
    {
        $genre = $this->genreFor($book);

        $pairs = [
            'epistle' => ["Kasih Karunia (Gratia Dei)", "Iman yang Hidup", "Komunitas Iman"],
            'gospel' => ["Kerajaan Allah", "Identitas Yesus", "Pemuridan"],
            'psalm' => ["Kejujuran dalam Doa", "Pujian di Tengah Krisis", "Kepercayaan kepada Allah"],
            'prophecy' => ["Janji dan Penggenapan", "Penghakiman dan Harapan", "Kesetiaan Allah"],
            'narrative' => ["Providensia Ilahi", "Kesetiaan di Tengah Kesulitan", "Perjanjian Allah"],
        ];

        return $pairs[$genre] ?? ["Kasih Allah", "Kesetiaan", "Harapan"];
    }

    private function historicalContext(string $book): ?string
    {
        $contexts = [
            'yoh' => "Injil Yohanes ditulis sekitar tahun 90 M, ditujukan kepada komunitas yang sedang menghadapi tekanan dari sinagoga. Yohanes menekankan identitas ilahi Yesus lebih eksplisit dari injil-injil sinoptik.",
            'rom' => "Roma ditulis Paulus sekitar 57 M kepada jemaat campuran Yahudi dan non-Yahudi yang belum pernah ia kunjungi. Tema utamanya adalah kebenaran Allah yang tersedia bagi semua orang melalui iman.",
            'mzm' => "Mazmur adalah kumpulan puisi liturgi Ibrani yang ditulis selama berabad-abad, dari zaman Daud hingga periode pasca-pembuangan. Mereka digunakan dalam ibadat Bait Suci dan sinagoga.",
            'kej' => "Kejadian menceritakan awal — penciptaan, kejatuhan, dan awal kisah umat pilihan Allah. Ditulis dalam konteks budaya Timur Dekat Kuno, menggunakan genre narasi teologis, bukan laporan saintifik.",
            'luk' => "Lukas ditulis oleh seorang dokter Yunani sekitar 80–85 M. Dari keempat injil, Lukas paling banyak menekankan peran perempuan, orang miskin, dan orang luar dalam kisah Yesus.",
            'ef' => "Efesus adalah surat Paulus kepada jemaat di kota pelabuhan penting. Befokus pada identitas gereja sebagai tubuh Kristus dan bagaimana iman mengubah cara hidup di masyarakat.",
            '1kor' => "1 Korintus ditulis untuk jemaat yang kacau — ada perpecahan, dosa seksual, dan perselisihan tentang karunia rohani. Paulus menjawab pertanyaan-pertanyaan nyata dari komunitas nyata.",
            'flp' => "Filipi ditulis Paulus dari penjara. Meski situasinya berat, nada suratnya adalah sukacita. Ini surat yang paling personal dan hangat dari Paulus.",
            'mat' => "Matius ditulis untuk komunitas Yahudi-Kristen, menekankan Yesus sebagai penggenapan nubuat Torah. Strukturnya menggemakan Musa dengan Lima Khotbah besar.",
            'mrk' => "Markus adalah injil paling awal dan paling pendek, ditulis sekitar 65–70 M. Narasinya cepat dan penuh tindakan — kata 'segera' (euthys) muncul lebih dari 40 kali.",
        ];

        return $contexts[$book] ?? null;
    }

    private function genreFor(string $book): string
    {
        $genres = [
            'epistles' => ['rom', '1kor', '2kor', 'gal', 'ef', 'flp', 'kol', '1tes', '2tes', '1tim', '2tim', 'tit', 'flm', 'ibr', 'yak', '1ptr', '2ptr', '1yoh', '2yoh', '3yoh', 'yud'],
            'gospels' => ['mat', 'mrk', 'luk', 'yoh'],
            'psalms' => ['mzm'],
            'prophecy' => ['yes', 'yer', 'rat', 'yeh', 'dan', 'hos', 'yoe', 'ams', 'ob', 'yun', 'mik', 'nah', 'hab', 'zef', 'hag', 'zak', 'mal', 'why'],
            'narrative' => ['kej', 'kel', 'ima', 'bil', 'ul', 'yos', 'hak', 'rut', '1sam', '2sam', '1raj', '2raj', '1taw', '2taw', 'ezr', 'neh', 'est', 'kis'],
        ];

        foreach ($genres as $genre => $books) {
            if (in_array($book, $books, true))
                return $genre;
        }

        return 'general';
    }

    private function siblingRefs(string $book, int $chapter): array
    {
        // Return adjacent chapter references as suggested reading.
        $prev = $chapter > 1 ? "{$book}-" . ($chapter - 1) . "-1" : null;
        $next = "{$book}-" . ($chapter + 1) . "-1";

        return array_filter([$prev, $next]);
    }

    private function contains(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($haystack, $needle))
                return true;
        }
        return false;
    }
}
