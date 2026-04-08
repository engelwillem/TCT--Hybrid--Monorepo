<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BibleVerse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RenunganPersonalizationController extends Controller
{
    private const THEME_PROFILES = [
        'gratitude' => [
            'keywords' => ['syukur', 'bersyukur', 'berkat', 'puji', 'pujian', 'terima kasih', 'sukacita', 'bahagia', 'senang'],
            'tone_affinity' => 'positive',
            'emotional_need' => 'syukur yang stabil',
            'spiritual_need' => 'hati yang menyembah',
            'intent' => 'mengucap syukur',
            'verse_hints' => ['bersyukur', 'sukacita', 'pujian', 'memuji', 'syukur', 'kemurahan'],
            'book_boost' => ['mzm', '1tes', 'kol', 'ef'],
        ],
        'anxiety' => [
            'keywords' => ['cemas', 'khawatir', 'takut', 'gelisah', 'panik', 'deg-degan', 'resah', 'kuatir'],
            'tone_affinity' => 'negative',
            'emotional_need' => 'ketenangan',
            'spiritual_need' => 'percaya pemeliharaan Tuhan',
            'intent' => 'mencari rasa aman',
            'verse_hints' => ['damai', 'tenang', 'jangan takut', 'jangan khawatir', 'percaya', 'menyerahkan'],
            'book_boost' => ['mzm', 'mat', 'yes', 'flp', 'yoh'],
        ],
        'fatigue' => [
            'keywords' => ['lelah', 'capek', 'penat', 'burnout', 'letih', 'habis tenaga', 'kelelahan', 'jenuh'],
            'tone_affinity' => 'negative',
            'emotional_need' => 'kelegaan',
            'spiritual_need' => 'kekuatan baru',
            'intent' => 'butuh pemulihan',
            'verse_hints' => ['kekuatan', 'istirahat', 'dipulihkan', 'ditopang', 'dikuatkan'],
            'book_boost' => ['yes', 'mat', 'mzm', 'ibr'],
        ],
        'guilt' => [
            'keywords' => ['dosa', 'bersalah', 'malu', 'jatuh', 'gagal', 'ampun', 'menyesal', 'hancur'],
            'tone_affinity' => 'negative',
            'emotional_need' => 'diterima kembali',
            'spiritual_need' => 'pengampunan dan pemulihan',
            'intent' => 'ingin dipulihkan',
            'verse_hints' => ['ampuni', 'kasih setia', 'anugerah', 'dipulihkan', 'belas kasihan'],
            'book_boost' => ['1yoh', 'mzm', 'rom', 'luk'],
        ],
        'direction' => [
            'keywords' => ['bingung', 'keputusan', 'jalan', 'masa depan', 'pilihan', 'rencana', 'arah', 'langkah'],
            'tone_affinity' => 'neutral',
            'emotional_need' => 'kejelasan',
            'spiritual_need' => 'hikmat dan tuntunan',
            'intent' => 'mencari arah',
            'verse_hints' => ['hikmat', 'tuntun', 'jalan', 'percaya', 'nasihat', 'pimpin'],
            'book_boost' => ['ams', 'mzm', 'yes', 'yak'],
        ],
        'relationship' => [
            'keywords' => ['keluarga', 'suami', 'istri', 'anak', 'rumah', 'hubungan', 'orang tua', 'teman', 'konflik'],
            'tone_affinity' => 'neutral',
            'emotional_need' => 'rekonsiliasi',
            'spiritual_need' => 'kasih dan kesabaran',
            'intent' => 'memulihkan relasi',
            'verse_hints' => ['kasih', 'sabar', 'mengampuni', 'damai', 'lemah lembut'],
            'book_boost' => ['ef', 'kol', '1kor', 'mzm', 'rom'],
        ],
    ];

    /**
     * Generate personal renungan from user reflection text using Bible DB candidates.
     */
    public function personalize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => ['required', 'string', 'min:3', 'max:5000'],
            'lang' => ['nullable', 'string', 'in:id,en'],
        ]);

        $reflectionText = trim((string) $validated['text']);
        $lang = (($validated['lang'] ?? 'id') === 'en') ? 'id' : 'id';

        $analysis = $this->analyzeReflection($reflectionText);
        $searchTerms = $this->buildSearchTerms($reflectionText, $analysis);
        $candidates = $this->queryVerseCandidates($lang, $searchTerms);
        $selected = $this->selectCorrelatedVerses($candidates, $searchTerms, $analysis, $reflectionText);

        if (empty($selected)) {
            $fallback = BibleVerse::query()
                ->where('provider', 'ayt')
                ->where('lang', $lang)
                ->where('book_code', 'mzm')
                ->where('chapter', 55)
                ->where('verse', 23)
                ->first();
            if ($fallback) {
                $selected = [$fallback];
            }
        }

        $primary = $selected[0] ?? null;
        $meditation = $this->composeMeditation($reflectionText, $analysis, $selected);

        return response()->json([
            'data' => [
                'meditation' => $meditation,
                'verse' => [
                    'reference' => (string) ($primary?->reference ?? 'Mazmur 55:23'),
                    'text' => (string) ($primary?->text ?? 'Serahkanlah kuatirmu kepada TUHAN, maka Ia akan memelihara engkau.'),
                ],
                'related_verses' => collect($selected)
                    ->map(fn (BibleVerse $verse) => [
                        'reference' => (string) ($verse->reference ?? ''),
                        'text' => (string) ($verse->text ?? ''),
                    ])
                    ->values()
                    ->all(),
                'analysis' => $analysis,
            ],
        ]);
    }

    private function analyzeReflection(string $text): array
    {
        $normalized = $this->normalizeText($text);
        $tokens = explode(' ', $normalized);

        $positiveWords = ['syukur', 'bersyukur', 'berkat', 'sukacita', 'damai', 'tenang', 'lega', 'puji', 'terima kasih', 'ditolong'];
        $negativeWords = ['cemas', 'khawatir', 'takut', 'gelisah', 'lelah', 'capek', 'malu', 'bersalah', 'gagal', 'sendiri', 'bingung'];

        $positiveScore = $this->countWeightedMatches($normalized, $positiveWords);
        $negativeScore = $this->countWeightedMatches($normalized, $negativeWords);
        $tone = $positiveScore >= $negativeScore + 2 ? 'positive' : ($negativeScore >= $positiveScore + 2 ? 'negative' : 'neutral');

        $scores = [];
        foreach (self::THEME_PROFILES as $theme => $profile) {
            $score = $this->countWeightedMatches($normalized, $profile['keywords']);
            foreach ($tokens as $token) {
                if (strlen($token) > 3 && in_array($token, $profile['keywords'], true)) {
                    $score += 1.2;
                }
            }

            if (($profile['tone_affinity'] ?? 'neutral') === $tone) {
                $score += 1.5;
            }
            if ($theme === 'gratitude' && $tone === 'positive') {
                $score += 2;
            }

            if ($score > 0) {
                $scores[$theme] = round($score, 2);
            }
        }

        arsort($scores, SORT_NUMERIC);
        $topThemes = array_slice(array_keys($scores), 0, 3);
        $primaryTheme = $topThemes[0] ?? ($tone === 'positive' ? 'gratitude' : 'direction');
        $selectedProfile = self::THEME_PROFILES[$primaryTheme] ?? self::THEME_PROFILES['direction'];
        $intent = $this->inferIntent($primaryTheme, $tone, $normalized);

        return [
            'primary_theme' => $primaryTheme,
            'secondary_themes' => array_values(array_slice($topThemes, 1)),
            'emotional_need' => $selectedProfile['emotional_need'],
            'spiritual_need' => $selectedProfile['spiritual_need'],
            'intent' => $intent,
            'tone' => $tone,
            'positive_score' => $positiveScore,
            'negative_score' => $negativeScore,
        ];
    }

    private function buildSearchTerms(string $text, array $analysis): array
    {
        $normalized = $this->normalizeText($text);

        $tokens = collect(explode(' ', $normalized))
            ->filter(fn (string $token) => strlen($token) >= 3)
            ->reject(fn (string $token) => in_array($token, [
                'yang', 'dengan', 'untuk', 'dalam', 'sudah', 'akan', 'saya', 'kami', 'kamu', 'dari', 'karena', 'tetapi',
            ], true))
            ->take(10)
            ->values()
            ->all();

        $primaryTheme = (string) ($analysis['primary_theme'] ?? 'direction');
        $themeTerms = self::THEME_PROFILES[$primaryTheme]['verse_hints'] ?? ['percaya', 'pengharapan'];
        $secondaryTerms = collect((array) ($analysis['secondary_themes'] ?? []))
            ->flatMap(fn (string $theme) => self::THEME_PROFILES[$theme]['verse_hints'] ?? [])
            ->take(4)
            ->values()
            ->all();

        return collect(array_merge($tokens, $themeTerms, $secondaryTerms))
            ->map(fn (string $term) => trim($term))
            ->filter()
            ->unique()
            ->take(18)
            ->values()
            ->all();
    }

    private function queryVerseCandidates(string $lang, array $searchTerms)
    {
        if (empty($searchTerms)) {
            return collect();
        }

        return BibleVerse::query()
            ->where('provider', 'ayt')
            ->where('lang', $lang)
            ->where(function ($query) use ($searchTerms): void {
                foreach ($searchTerms as $term) {
                    $query->orWhere('text', 'like', '%'.$term.'%')
                        ->orWhere('reference', 'like', '%'.$term.'%');
                }
            })
            ->orderBy('book_code')
            ->orderBy('chapter')
            ->orderBy('verse')
            ->limit(220)
            ->get();
    }

    private function selectCorrelatedVerses($candidates, array $searchTerms, array $analysis, string $reflectionText): array
    {
        if ($candidates->isEmpty()) {
            return [];
        }

        $normalizedTerms = collect($searchTerms)->map(fn (string $term) => Str::lower($term))->all();
        $primaryTheme = (string) ($analysis['primary_theme'] ?? '');
        $tone = (string) ($analysis['tone'] ?? 'neutral');
        $themeHints = self::THEME_PROFILES[$primaryTheme]['verse_hints'] ?? [];
        $bookBoost = self::THEME_PROFILES[$primaryTheme]['book_boost'] ?? ['mzm', 'mat', 'yoh'];
        $reflectionNormalized = $this->normalizeText($reflectionText);

        $scored = $candidates
            ->map(function (BibleVerse $verse) use ($normalizedTerms, $themeHints, $bookBoost, $tone, $reflectionNormalized) {
                $text = Str::lower((string) $verse->text);
                $score = 0;

                foreach ($normalizedTerms as $term) {
                    if ($term !== '' && Str::contains($text, $term)) {
                        $score += strlen($term) > 5 ? 9 : 6;
                    }
                }

                foreach ($themeHints as $hint) {
                    if (Str::contains($text, Str::lower($hint))) {
                        $score += 7;
                    }
                }

                if (in_array((string) $verse->book_code, $bookBoost, true)) {
                    $score += 8;
                }

                if ($tone === 'positive' && (Str::contains($text, 'sukacita') || Str::contains($text, 'bersyukur') || Str::contains($text, 'pujilah'))) {
                    $score += 10;
                }
                if ($tone === 'negative' && (Str::contains($text, 'jangan takut') || Str::contains($text, 'jangan khawatir') || Str::contains($text, 'damai sejahtera'))) {
                    $score += 9;
                }

                if ($tone === 'positive' && (Str::contains($text, 'air mata') || Str::contains($text, 'dukacita') || Str::contains($text, 'ratapan'))) {
                    $score -= 4;
                }
                if ($tone === 'negative' && Str::contains($text, 'bersukacitalah')) {
                    $score -= 2;
                }

                if ($reflectionNormalized !== '' && Str::contains($reflectionNormalized, 'berkat') && Str::contains($text, 'berkat')) {
                    $score += 6;
                }

                return [
                    'verse' => $verse,
                    'score' => $score,
                ];
            })
            ->sortByDesc('score')
            ->values();

        if ($scored->isEmpty()) {
            return [];
        }

        /** @var BibleVerse $primary */
        $primary = $scored[0]['verse'];
        $selected = [$primary];

        // Prioritize correlated verses from same book/chapter, then wider top-ranked support.
        $relatedFromSameBook = $scored
            ->filter(fn (array $item) => (string) $item['verse']->book_code === (string) $primary->book_code)
            ->map(fn (array $item) => $item['verse'])
            ->reject(fn (BibleVerse $v) => (int) $v->id === (int) $primary->id)
            ->unique(fn (BibleVerse $v) => (string) $v->reference)
            ->take(2)
            ->values()
            ->all();

        foreach ($relatedFromSameBook as $verse) {
            $selected[] = $verse;
        }

        if (count($selected) < 3) {
            $topOthers = $scored
                ->map(fn (array $item) => $item['verse'])
                ->reject(fn (BibleVerse $v) => collect($selected)->contains(fn (BibleVerse $s) => (int) $s->id === (int) $v->id))
                ->unique(fn (BibleVerse $v) => (string) $v->reference)
                ->take(3 - count($selected))
                ->values()
                ->all();

            foreach ($topOthers as $verse) {
                $selected[] = $verse;
            }
        }

        return array_values($selected);
    }

    private function composeMeditation(string $reflectionText, array $analysis, array $selectedVerses): string
    {
        $reflectionSummary = trim(Str::of($reflectionText)->replaceMatches('/\s+/', ' ')->limit(120, '...')->value());
        $primaryTheme = (string) ($analysis['primary_theme'] ?? 'direction');
        $tone = (string) ($analysis['tone'] ?? 'neutral');
        $emotionalNeed = (string) ($analysis['emotional_need'] ?? 'ketenangan');
        $spiritualNeed = (string) ($analysis['spiritual_need'] ?? 'pengharapan');

        $opening = match ($tone) {
            'positive' => match ($primaryTheme) {
                'gratitude' => "Syukurmu hari ini adalah ibadah yang indah di hadapan Tuhan.",
                default => "Ada benih pengharapan yang sehat dalam isi hatimu hari ini.",
            },
            'negative' => match ($primaryTheme) {
                'anxiety' => "Tuhan hadir menenangkanmu, bukan menuntutmu terlihat kuat.",
                'fatigue' => "Dalam lelahmu, Tuhan tidak menjauh; Ia memberi ruang untuk dipulihkan.",
                'guilt' => "Kasih Tuhan tidak menutup pintu bagimu; kasih-Nya membuka jalan pulih.",
                default => "Tuhan melihat hatimu dengan lembut, bahkan di saat berat.",
            },
            default => match ($primaryTheme) {
                'direction' => "Tuhan menuntun langkahmu setahap demi setahap, tidak dengan tergesa-gesa.",
                'relationship' => "Tuhan membentuk relasimu lewat kasih yang sabar dan jujur.",
                default => "Tuhan memahami isi hatimu dan menuntunmu dengan tenang.",
            },
        };

        $support = match ($primaryTheme) {
            'gratitude' => "Terus rawat ucapan syukur itu agar hatimu tetap peka pada kebaikan-Nya.",
            'anxiety' => "Tarik napas perlahan, serahkan yang tak bisa kamu kendalikan, lalu berjalan dalam damai-Nya.",
            'fatigue' => "Kamu boleh berhenti sejenak; kekuatan yang dari Tuhan cukup untuk langkah berikutnya.",
            'guilt' => "Pengakuan yang jujur bukan akhir, melainkan awal pemulihan dan hidup baru.",
            'direction' => "Saat arah belum jelas, setia pada langkah kecil hari ini sering menjadi pintu hikmat esok.",
            'relationship' => "Minta hati yang lembut untuk mendengar, mengampuni, dan membangun ulang kepercayaan.",
            default => "Tetaplah dekat pada Tuhan, karena dari sana arah dan keteguhan hati dipulihkan.",
        };

        $verseEcho = $this->buildVerseEcho($selectedVerses, $tone);

        return trim($opening.' "'.$reflectionSummary.'". '.$support.' Saat ini kamu butuh '.$emotionalNeed.', dan Tuhan menuntunmu pada '.$spiritualNeed.'.'.$verseEcho.' Langkahmu hari ini tetap berharga di hadapan-Nya.');
    }

    private function buildVerseEcho(array $selectedVerses, string $tone): string
    {
        $snippet = collect($selectedVerses)
            ->map(fn (BibleVerse $verse) => Str::of((string) $verse->text)->replaceMatches('/\s+/', ' ')->trim()->limit(88, '...')->value())
            ->filter()
            ->take(1)
            ->first();

        if (!is_string($snippet) || $snippet === '') {
            return '';
        }

        $prefix = $tone === 'positive'
            ? ' Firman juga menguatkan syukurmu: '
            : ' Firman meneguhkan hatimu: ';

        return $prefix.$snippet.'.';
    }

    private function normalizeText(string $text): string
    {
        return (string) Str::of(Str::lower($text))
            ->replaceMatches('/[^a-z0-9\s]/', ' ')
            ->replaceMatches('/\s+/', ' ')
            ->trim();
    }

    private function countWeightedMatches(string $normalizedText, array $keywords): float
    {
        $score = 0.0;
        foreach ($keywords as $keyword) {
            $needle = Str::lower(trim((string) $keyword));
            if ($needle === '') {
                continue;
            }
            if (Str::contains($normalizedText, $needle)) {
                $score += strlen($needle) > 6 ? 1.4 : 1.0;
            }
        }

        return $score;
    }

    private function inferIntent(string $primaryTheme, string $tone, string $normalized): string
    {
        if ($primaryTheme === 'gratitude') {
            return 'mengucap syukur';
        }
        if ($primaryTheme === 'anxiety' && Str::contains($normalized, 'takut')) {
            return 'mencari ketenangan atas rasa takut';
        }
        if ($primaryTheme === 'direction' && Str::contains($normalized, 'keputusan')) {
            return 'meminta hikmat untuk mengambil keputusan';
        }
        if ($primaryTheme === 'guilt') {
            return 'mencari pengampunan dan pemulihan';
        }
        if ($primaryTheme === 'relationship') {
            return 'membangun relasi dengan kasih dan kesabaran';
        }

        return $tone === 'positive' ? 'menjaga hati tetap bersyukur' : (self::THEME_PROFILES[$primaryTheme]['intent'] ?? 'mencari penguatan iman');
    }
}
