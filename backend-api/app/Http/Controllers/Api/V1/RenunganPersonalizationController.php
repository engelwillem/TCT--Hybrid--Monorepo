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
            'keywords' => ['syukur', 'bersyukur', 'berkat', 'puji', 'pujian', 'terima kasih', 'sukacita', 'bahagia', 'lega'],
            'emotion' => 'joyful',
            'emotional_need' => 'syukur yang stabil',
            'spiritual_need' => 'hati yang menyembah',
            'intent' => 'mengucap syukur',
            'verse_hints' => ['bersyukur', 'sukacita', 'pujilah', 'kemurahan', 'setia'],
            'book_boost' => ['mzm', '1tes', 'kol', 'ef'],
            'preferred_verse_tone' => 'worshipful',
        ],
        'longing_family' => [
            'keywords' => ['rindu', 'kangen', 'merindukan', 'jauh', 'terpisah', 'pisah', 'anak', 'istri', 'suami', 'keluarga'],
            'emotion' => 'longing',
            'emotional_need' => 'dikuatkan dalam kerinduan',
            'spiritual_need' => 'penghiburan dan penjagaan Tuhan',
            'intent' => 'mempercayakan orang terkasih kepada Tuhan',
            'verse_hints' => ['menyertai', 'lindungi', 'pelihara', 'dekat', 'damai'],
            'book_boost' => ['mzm', 'yes', 'yoh', 'flp'],
            'preferred_verse_tone' => 'comforting',
        ],
        'relationship_conflict' => [
            'keywords' => ['bertengkar', 'konflik', 'marah', 'sakit hati', 'kecewa', 'disakiti', 'bermusuhan', 'rekonsiliasi'],
            'emotion' => 'tense',
            'emotional_need' => 'hati yang tenang dan lembut',
            'spiritual_need' => 'kasih, pengampunan, dan pemulihan relasi',
            'intent' => 'memulihkan relasi',
            'verse_hints' => ['kasih', 'sabar', 'mengampuni', 'damai', 'lemah lembut'],
            'book_boost' => ['ef', 'kol', '1kor', 'rom', 'mzm'],
            'preferred_verse_tone' => 'restorative',
        ],
        'anxiety' => [
            'keywords' => ['cemas', 'khawatir', 'takut', 'gelisah', 'panik', 'resah', 'kuatir', 'degdegan'],
            'emotion' => 'anxious',
            'emotional_need' => 'ketenangan',
            'spiritual_need' => 'percaya pemeliharaan Tuhan',
            'intent' => 'mencari rasa aman',
            'verse_hints' => ['jangan takut', 'jangan khawatir', 'damai', 'tenang', 'percaya'],
            'book_boost' => ['mzm', 'mat', 'yes', 'flp', 'yoh'],
            'preferred_verse_tone' => 'comforting',
        ],
        'fatigue' => [
            'keywords' => ['lelah', 'letih', 'capek', 'penat', 'burnout', 'habis tenaga', 'kelelahan', 'jenuh'],
            'emotion' => 'weary',
            'emotional_need' => 'kelegaan',
            'spiritual_need' => 'kekuatan baru',
            'intent' => 'butuh pemulihan',
            'verse_hints' => ['kekuatan', 'istirahat', 'dipulihkan', 'ditopang', 'dikuatkan'],
            'book_boost' => ['yes', 'mat', 'mzm', 'ibr'],
            'preferred_verse_tone' => 'restorative',
        ],
        'guilt' => [
            'keywords' => ['dosa', 'bersalah', 'malu', 'jatuh', 'gagal', 'ampun', 'menyesal', 'bertobat'],
            'emotion' => 'contrite',
            'emotional_need' => 'diterima kembali',
            'spiritual_need' => 'pengampunan dan pemulihan',
            'intent' => 'mencari pengampunan',
            'verse_hints' => ['ampuni', 'anugerah', 'kasih setia', 'belas kasihan', 'dipulihkan'],
            'book_boost' => ['1yoh', 'mzm', 'rom', 'luk'],
            'preferred_verse_tone' => 'restorative',
        ],
        'direction' => [
            'keywords' => ['bingung', 'keputusan', 'jalan', 'masa depan', 'pilihan', 'rencana', 'arah', 'langkah'],
            'emotion' => 'uncertain',
            'emotional_need' => 'kejelasan',
            'spiritual_need' => 'hikmat dan tuntunan',
            'intent' => 'mencari arah',
            'verse_hints' => ['hikmat', 'tuntun', 'jalan', 'percaya', 'nasihat'],
            'book_boost' => ['ams', 'mzm', 'yes', 'yak'],
            'preferred_verse_tone' => 'guiding',
        ],
        'surrender' => [
            'keywords' => ['serahkan', 'pasrah', 'berserah', 'kehendakmu', 'menyerah kepada tuhan'],
            'emotion' => 'yielding',
            'emotional_need' => 'hati yang tenang',
            'spiritual_need' => 'iman untuk berserah',
            'intent' => 'menyerahkan keadaan kepada Tuhan',
            'verse_hints' => ['serahkan', 'percaya', 'menopang', 'setia', 'damai'],
            'book_boost' => ['mzm', 'ams', 'mat', 'flp'],
            'preferred_verse_tone' => 'guiding',
        ],
    ];

    private const EMOTION_PROFILES = [
        'joyful' => ['syukur', 'bersyukur', 'bahagia', 'sukacita', 'lega', 'damai'],
        'longing' => ['rindu', 'kangen', 'merindukan', 'jauh', 'terpisah', 'menanti'],
        'anxious' => ['cemas', 'khawatir', 'takut', 'gelisah', 'panik', 'resah'],
        'weary' => ['lelah', 'letih', 'capek', 'penat', 'burnout', 'jenuh'],
        'contrite' => ['bersalah', 'dosa', 'ampun', 'menyesal', 'malu', 'bertobat'],
        'uncertain' => ['bingung', 'ragu', 'keputusan', 'arah', 'pilihan', 'jalan'],
        'tense' => ['marah', 'konflik', 'bertengkar', 'sakit hati', 'kecewa'],
    ];

    private const INTENT_PROFILES = [
        'worship' => ['bersyukur', 'memuji', 'puji', 'terima kasih'],
        'comfort' => ['rindu', 'sendiri', 'kesepian', 'jauh', 'terpisah', 'cemas', 'takut'],
        'restoration' => ['ampun', 'dipulihkan', 'bertobat', 'memperbaiki', 'rekonsiliasi'],
        'guidance' => ['bingung', 'keputusan', 'arah', 'langkah', 'rencana', 'masa depan'],
        'surrender' => ['serahkan', 'pasrah', 'berserah', 'kehendakmu'],
    ];

    private const STOP_WORDS = [
        'yang', 'dengan', 'untuk', 'dalam', 'sudah', 'akan', 'saya', 'kami', 'kamu', 'dari', 'karena', 'tetapi',
        'atau', 'dan', 'itu', 'ini', 'hari', 'lagi', 'saat', 'agar', 'pada', 'kepada', 'seperti',
    ];

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
        $themeScores = $this->scoreProfiles($normalized, self::THEME_PROFILES);
        $emotionScores = $this->scoreProfiles($normalized, self::EMOTION_PROFILES);
        $intentScores = $this->scoreProfiles($normalized, self::INTENT_PROFILES);
        $contextFlags = $this->detectContextFlags($normalized);

        if ($contextFlags['has_family_terms'] && $contextFlags['has_longing_terms']) {
            $themeScores['longing_family'] = ($themeScores['longing_family'] ?? 0) + 3.5;
            $intentScores['comfort'] = ($intentScores['comfort'] ?? 0) + 2.0;
        }
        if ($contextFlags['has_conflict_terms']) {
            $themeScores['relationship_conflict'] = ($themeScores['relationship_conflict'] ?? 0) + 3.0;
            $intentScores['restoration'] = ($intentScores['restoration'] ?? 0) + 1.5;
        }
        if ($contextFlags['has_gratitude_terms']) {
            $themeScores['gratitude'] = ($themeScores['gratitude'] ?? 0) + 2.5;
            $intentScores['worship'] = ($intentScores['worship'] ?? 0) + 1.5;
        }

        arsort($themeScores, SORT_NUMERIC);
        arsort($emotionScores, SORT_NUMERIC);
        arsort($intentScores, SORT_NUMERIC);

        $primaryTheme = (string) (array_key_first($themeScores) ?? 'direction');
        $primaryEmotion = (string) (array_key_first($emotionScores) ?? (self::THEME_PROFILES[$primaryTheme]['emotion'] ?? 'uncertain'));
        $intent = $this->resolveIntent($intentScores, $primaryTheme, $normalized);
        $tone = $this->inferTone($primaryEmotion, $contextFlags);
        $intensity = $this->computeIntensity($text, $themeScores, $emotionScores);
        $profile = self::THEME_PROFILES[$primaryTheme] ?? self::THEME_PROFILES['direction'];

        $secondaryThemes = collect(array_keys($themeScores))
            ->reject(fn (string $theme) => $theme === $primaryTheme)
            ->take(2)
            ->values()
            ->all();

        $secondaryEmotions = collect(array_keys($emotionScores))
            ->reject(fn (string $emotion) => $emotion === $primaryEmotion)
            ->take(2)
            ->values()
            ->all();

        return [
            'primary_theme' => $primaryTheme,
            'secondary_themes' => $secondaryThemes,
            'primary_emotion' => $primaryEmotion,
            'secondary_emotions' => $secondaryEmotions,
            'intent' => $intent,
            'tone' => $tone,
            'intensity' => $intensity,
            'relational_context' => $this->resolveRelationalContext($contextFlags),
            'emotional_need' => (string) ($profile['emotional_need'] ?? 'ketenangan'),
            'spiritual_need' => (string) ($profile['spiritual_need'] ?? 'pengharapan'),
            'preferred_verse_tone' => (string) ($profile['preferred_verse_tone'] ?? 'comforting'),
            'context_flags' => $contextFlags,
            'theme_scores' => $this->roundScores($themeScores),
            'emotion_scores' => $this->roundScores($emotionScores),
        ];
    }

    private function buildSearchTerms(string $text, array $analysis): array
    {
        $normalized = $this->normalizeText($text);
        $tokens = collect(explode(' ', $normalized))
            ->filter(fn (string $token) => strlen($token) >= 3)
            ->reject(fn (string $token) => in_array($token, self::STOP_WORDS, true))
            ->take(12)
            ->values()
            ->all();

        $primaryTheme = (string) ($analysis['primary_theme'] ?? 'direction');
        $secondaryThemes = (array) ($analysis['secondary_themes'] ?? []);
        $primaryEmotion = (string) ($analysis['primary_emotion'] ?? 'uncertain');
        $intent = (string) ($analysis['intent'] ?? 'guidance');
        $contextFlags = (array) ($analysis['context_flags'] ?? []);

        $themeTerms = self::THEME_PROFILES[$primaryTheme]['verse_hints'] ?? ['percaya', 'pengharapan'];
        $secondaryTerms = collect($secondaryThemes)
            ->flatMap(fn (string $theme) => self::THEME_PROFILES[$theme]['verse_hints'] ?? [])
            ->take(4)
            ->values()
            ->all();

        $emotionHints = [
            'joyful' => ['sukacita', 'bersyukur', 'pujilah'],
            'longing' => ['menyertai', 'pelihara', 'dekat'],
            'anxious' => ['damai', 'tenang', 'jangan takut'],
            'weary' => ['kekuatan', 'istirahat', 'ditopang'],
            'contrite' => ['ampuni', 'anugerah', 'dipulihkan'],
            'uncertain' => ['hikmat', 'tuntun', 'jalan'],
            'tense' => ['kasih', 'sabar', 'mengampuni'],
        ][$primaryEmotion] ?? ['percaya', 'setia'];

        $intentHints = [
            'worship' => ['puji', 'syukur', 'kemuliaan'],
            'comfort' => ['penghiburan', 'dekat', 'menyertai'],
            'restoration' => ['pemulihan', 'pengampunan', 'damai'],
            'guidance' => ['hikmat', 'tuntunan', 'arah'],
            'surrender' => ['serahkan', 'percaya', 'damai'],
        ][$intent] ?? ['percaya', 'pengharapan'];

        $contextTerms = [];
        if (($contextFlags['has_family_terms'] ?? false) && ($contextFlags['has_longing_terms'] ?? false)) {
            $contextTerms = ['keluarga', 'pelihara', 'lindungi', 'menyertai'];
        } elseif (($contextFlags['has_conflict_terms'] ?? false)) {
            $contextTerms = ['kasih', 'damai', 'mengampuni'];
        }

        return collect(array_merge($tokens, $themeTerms, $secondaryTerms, $emotionHints, $intentHints, $contextTerms))
            ->map(fn (string $term) => trim($term))
            ->filter()
            ->unique()
            ->take(22)
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
            ->limit(280)
            ->get();
    }

    private function selectCorrelatedVerses($candidates, array $searchTerms, array $analysis, string $reflectionText): array
    {
        if ($candidates->isEmpty()) {
            return [];
        }

        $normalizedTerms = collect($searchTerms)
            ->map(fn (string $term) => Str::lower($term))
            ->filter()
            ->values()
            ->all();

        $primaryTheme = (string) ($analysis['primary_theme'] ?? 'direction');
        $bookBoost = self::THEME_PROFILES[$primaryTheme]['book_boost'] ?? ['mzm', 'mat', 'yoh'];
        $preferredTone = (string) ($analysis['preferred_verse_tone'] ?? 'comforting');
        $contextFlags = (array) ($analysis['context_flags'] ?? []);
        $reflectionNormalized = $this->normalizeText($reflectionText);

        $scored = $candidates
            ->map(function (BibleVerse $verse) use ($normalizedTerms, $analysis, $bookBoost, $preferredTone, $contextFlags, $reflectionNormalized) {
                $verseText = Str::lower((string) $verse->text);
                $score = 0.0;

                foreach ($normalizedTerms as $term) {
                    if (Str::contains($verseText, $term)) {
                        $score += strlen($term) > 5 ? 8.5 : 5.5;
                    }
                }

                $themeHints = self::THEME_PROFILES[(string) ($analysis['primary_theme'] ?? 'direction')]['verse_hints'] ?? [];
                foreach ($themeHints as $hint) {
                    if (Str::contains($verseText, Str::lower($hint))) {
                        $score += 7.0;
                    }
                }

                if (in_array((string) $verse->book_code, $bookBoost, true)) {
                    $score += 8.0;
                }

                $verseTone = $this->classifyVerseTone($verseText);
                if ($verseTone === $preferredTone) {
                    $score += 9.5;
                } elseif ($preferredTone === 'comforting' && $verseTone === 'restorative') {
                    $score += 4.0;
                } elseif ($verseTone === 'corrective' && $preferredTone !== 'corrective') {
                    $score -= 7.5;
                }

                if (($contextFlags['has_family_terms'] ?? false) && ($contextFlags['has_longing_terms'] ?? false)) {
                    if (Str::contains($verseText, 'menyertai') || Str::contains($verseText, 'pelihara') || Str::contains($verseText, 'lindungi')) {
                        $score += 10.0;
                    }
                    if (Str::contains($verseText, 'bertengkar') || Str::contains($verseText, 'perselisihan')) {
                        $score -= 8.0;
                    }
                }

                if (($contextFlags['has_conflict_terms'] ?? false) && (Str::contains($verseText, 'mengampuni') || Str::contains($verseText, 'damai'))) {
                    $score += 7.0;
                }

                if (Str::contains($reflectionNormalized, 'berkat') && Str::contains($verseText, 'berkat')) {
                    $score += 6.0;
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

        $supporting = $scored
            ->skip(1)
            ->map(fn (array $item) => $item['verse'])
            ->unique(fn (BibleVerse $verse) => (string) $verse->reference)
            ->reject(fn (BibleVerse $verse) => (int) $verse->id === (int) $primary->id)
            ->take(2)
            ->values()
            ->all();

        foreach ($supporting as $verse) {
            $selected[] = $verse;
        }

        return array_values($selected);
    }

    private function composeMeditation(string $reflectionText, array $analysis, array $selectedVerses): string
    {
        $primaryTheme = (string) ($analysis['primary_theme'] ?? 'direction');
        $primaryEmotion = (string) ($analysis['primary_emotion'] ?? 'uncertain');
        $intent = (string) ($analysis['intent'] ?? 'guidance');
        $relationalContext = (string) ($analysis['relational_context'] ?? 'neutral');
        $emotionalNeed = (string) ($analysis['emotional_need'] ?? 'ketenangan');
        $spiritualNeed = (string) ($analysis['spiritual_need'] ?? 'pengharapan');
        $reflectionEcho = $this->extractReflectionEcho($reflectionText, $primaryTheme);

        $opening = match ($primaryTheme) {
            'gratitude' => "Syukurmu hari ini adalah respons iman yang indah.",
            'longing_family' => "Kerinduanmu kepada orang yang kamu kasihi adalah ungkapan kasih yang tulus, dan Tuhan memahaminya sepenuhnya.",
            'relationship_conflict' => "Tuhan melihat luka relasimu dengan kasih yang tidak menghakimi.",
            'anxiety' => "Tuhan hadir menenangkan hatimu di tengah rasa cemas.",
            'fatigue' => "Dalam lelahmu, Tuhan tidak menekanmu; Ia meneduhkan dan menguatkanmu.",
            'guilt' => "Kasih Tuhan membukakan jalan pulih, bahkan ketika kamu merasa gagal.",
            'surrender' => "Keinginanmu untuk berserah adalah langkah iman yang dewasa.",
            default => "Tuhan menuntunmu dengan lembut ketika arah terasa belum jelas.",
        };

        $body = match ($primaryTheme) {
            'gratitude' => "Rawatlah hati yang bersyukur itu agar tetap berakar pada kebaikan-Nya, bukan pada situasi yang berubah.",
            'longing_family' => "Di tengah jarak atau perpisahan, kamu boleh mempercayakan mereka ke dalam penjagaan-Nya sambil terus mendoakan perlindungan dan damai.",
            'relationship_conflict' => "Mintalah hati yang lembut untuk berkata benar dalam kasih, sehingga pemulihan terjadi tanpa kehilangan ketegasan.",
            'anxiety' => "Tarik napas perlahan, serahkan hal yang di luar kendalimu, lalu melangkah dengan damai yang Tuhan berikan.",
            'fatigue' => "Kamu boleh beristirahat tanpa rasa bersalah, sebab Tuhan sanggup menambah kekuatanmu setahap demi setahap.",
            'guilt' => "Pengakuan yang jujur bukan akhir, melainkan pintu masuk untuk pengampunan, pemulihan, dan hidup baru.",
            'surrender' => "Saat kamu menyerahkan keadaanmu kepada Tuhan, Ia membentuk keteguhan yang tenang dari dalam.",
            default => "Setialah pada langkah kecil hari ini, karena Tuhan sering menyingkapkan arah melalui ketaatan yang sederhana.",
        };

        $closing = match (true) {
            $relationalContext === 'longing' => "Tuhan tetap menyertaimu hari ini dan menumbuhkan pengharapan untuk perjumpaan pada waktu-Nya.",
            $intent === 'worship' => "Biarlah penyembahanmu hari ini membuat hatimu makin peka terhadap kemurahan Tuhan.",
            $primaryEmotion === 'contrite' => "Kasih karunia-Nya lebih besar daripada rasa bersalahmu, dan masa depanmu tidak berhenti di kegagalan.",
            default => "Hari ini kamu membutuhkan {$emotionalNeed}, dan Tuhan menuntunmu kepada {$spiritualNeed}.",
        };

        $verseBridge = $this->buildVerseBridge($selectedVerses, $analysis);
        $raw = trim($opening.' '.$reflectionEcho.' '.$body.' '.$verseBridge.' '.$closing);

        return $this->finalizeMeditationText($raw, $analysis);
    }

    private function buildVerseBridge(array $selectedVerses, array $analysis): string
    {
        /** @var BibleVerse|null $primary */
        $primary = $selectedVerses[0] ?? null;
        $verseText = trim((string) ($primary?->text ?? ''));
        if ($verseText === '') {
            return 'Firman Tuhan tetap meneguhkan langkahmu hari ini.';
        }

        $normalized = (string) Str::of($verseText)
            ->replaceMatches('/\s+/', ' ')
            ->replaceMatches('/[\"\']/', '')
            ->trim();

        if (!preg_match('/[.!?]$/', $normalized)) {
            $normalized .= '.';
        }

        $intro = match ((string) ($analysis['tone'] ?? 'neutral')) {
            'positive' => 'Firman hari ini menguatkan syukurmu: ',
            'negative' => 'Firman hari ini meneduhkan hatimu: ',
            'tender' => 'Firman hari ini memeluk kerinduanmu: ',
            default => 'Firman hari ini menuntunmu: ',
        };

        return $intro.$normalized;
    }

    private function extractReflectionEcho(string $reflectionText, string $primaryTheme): string
    {
        $clean = trim((string) Str::of($reflectionText)->replaceMatches('/\s+/', ' '));
        if ($clean === '' || strlen($clean) > 180) {
            return match ($primaryTheme) {
                'longing_family' => "Kerinduan itu tidak membuatmu lemah; kerinduan itu menunjukkan kasih yang hidup.",
                'anxiety' => "Kamu tidak perlu pura-pura kuat ketika hatimu sedang mencari ketenangan.",
                default => "Tuhan menghargai kejujuran hatimu di hadapan-Nya.",
            };
        }

        $safe = preg_replace('/[\"\']+/', '', $clean) ?? $clean;

        return 'Saat kamu membawa isi hati ini dalam doa: '.$safe.'.';
    }

    private function finalizeMeditationText(string $meditation, array $analysis): string
    {
        $normalized = (string) Str::of($meditation)
            ->replaceMatches('/\s+/', ' ')
            ->replaceMatches('/\s+([,.;!?])/', '$1')
            ->trim();

        $normalized = preg_replace('/([!?.,;:]){2,}/', '$1', $normalized) ?? $normalized;
        $normalized = str_replace(['…', '...'], '.', $normalized);
        $normalized = preg_replace('/\s*"\s*/', '', $normalized) ?? $normalized;
        $normalized = trim($normalized);

        if ($normalized === '' || strlen($normalized) < 80) {
            return $this->composeSafeFallbackMeditation($analysis);
        }

        if (!preg_match('/[.!?]$/', $normalized)) {
            $normalized .= '.';
        }

        if (preg_match('/\b(dan|atau|karena|sehingga)\.?$/i', $normalized) || preg_match('/[,;:]$/', $normalized)) {
            $normalized .= ' Tuhan tetap menyertaimu dengan setia.';
        }

        return $normalized;
    }

    private function composeSafeFallbackMeditation(array $analysis): string
    {
        $theme = (string) ($analysis['primary_theme'] ?? 'direction');
        $emotionalNeed = (string) ($analysis['emotional_need'] ?? 'ketenangan');
        $spiritualNeed = (string) ($analysis['spiritual_need'] ?? 'pengharapan');

        $opening = match ($theme) {
            'gratitude' => 'Syukurmu hari ini adalah anugerah yang perlu dijaga dengan hati yang lembut.',
            'longing_family' => 'Kerinduanmu kepada keluarga adalah kasih yang berharga di hadapan Tuhan.',
            'anxiety' => 'Tuhan hadir menenangkanmu ketika hatimu terasa gelisah.',
            'fatigue' => 'Dalam kelelahanmu, Tuhan tetap menopangmu dengan kasih yang setia.',
            'guilt' => 'Kasih Tuhan tetap membuka jalan pengampunan dan pemulihan bagimu.',
            default => 'Tuhan memahami isi hatimu dan menuntunmu dengan lembut.',
        };

        return $opening.' Hari ini kamu membutuhkan '.$emotionalNeed.', dan Tuhan menuntunmu kepada '.$spiritualNeed.'. Kamu tidak berjalan sendiri.';
    }

    private function resolveRelationalContext(array $contextFlags): string
    {
        if (($contextFlags['has_family_terms'] ?? false) && ($contextFlags['has_longing_terms'] ?? false)) {
            return 'longing';
        }
        if ($contextFlags['has_conflict_terms'] ?? false) {
            return 'conflict';
        }

        return 'neutral';
    }

    private function resolveIntent(array $intentScores, string $primaryTheme, string $normalizedText): string
    {
        $bestIntent = array_key_first($intentScores);
        if (is_string($bestIntent) && ($intentScores[$bestIntent] ?? 0) >= 1.0) {
            return $bestIntent;
        }

        if ($primaryTheme === 'longing_family') {
            return 'comfort';
        }
        if ($primaryTheme === 'gratitude') {
            return 'worship';
        }
        if ($primaryTheme === 'guilt') {
            return 'restoration';
        }
        if ($primaryTheme === 'direction' || Str::contains($normalizedText, 'keputusan')) {
            return 'guidance';
        }
        if ($primaryTheme === 'surrender') {
            return 'surrender';
        }

        return 'guidance';
    }

    private function inferTone(string $primaryEmotion, array $contextFlags): string
    {
        if ($primaryEmotion === 'joyful') {
            return 'positive';
        }
        if (in_array($primaryEmotion, ['anxious', 'weary', 'contrite', 'tense'], true)) {
            return 'negative';
        }
        if (($contextFlags['has_longing_terms'] ?? false) && ($contextFlags['has_family_terms'] ?? false)) {
            return 'tender';
        }

        return 'neutral';
    }

    private function detectContextFlags(string $normalizedText): array
    {
        return [
            'has_family_terms' => $this->containsAny($normalizedText, ['anak', 'istri', 'suami', 'keluarga', 'orang tua']),
            'has_longing_terms' => $this->containsAny($normalizedText, ['rindu', 'kangen', 'merindukan', 'jauh', 'terpisah', 'pisah']),
            'has_conflict_terms' => $this->containsAny($normalizedText, ['konflik', 'bertengkar', 'marah', 'sakit hati', 'bermusuhan', 'kecewa']),
            'has_gratitude_terms' => $this->containsAny($normalizedText, ['syukur', 'bersyukur', 'berkat', 'terima kasih', 'puji']),
        ];
    }

    private function scoreProfiles(string $normalizedText, array $profiles): array
    {
        $scores = [];
        foreach ($profiles as $key => $profile) {
            $keywords = is_array($profile) && array_key_exists('keywords', $profile) ? (array) $profile['keywords'] : (array) $profile;
            $score = 0.0;
            foreach ($keywords as $keyword) {
                $needle = trim(Str::lower((string) $keyword));
                if ($needle === '') {
                    continue;
                }
                if (Str::contains($normalizedText, $needle)) {
                    $score += strlen($needle) >= 7 ? 1.4 : 1.0;
                }
            }
            if ($score > 0) {
                $scores[$key] = $score;
            }
        }

        return $scores;
    }

    private function classifyVerseTone(string $verseText): string
    {
        $toneKeywords = [
            'comforting' => ['jangan takut', 'jangan khawatir', 'damai', 'tenang', 'menyertai', 'penghiburan', 'pelihara', 'lindungi'],
            'worshipful' => ['bersyukur', 'pujilah', 'muliakan', 'sukacita', 'sorak', 'memuji'],
            'guiding' => ['hikmat', 'jalan', 'tuntun', 'nasihat', 'percaya', 'langkah'],
            'restorative' => ['ampun', 'anugerah', 'dipulihkan', 'belas kasihan', 'mengampuni'],
            'corrective' => ['bertobat', 'hukuman', 'tegur', 'kesalahan', 'jangan berbuat'],
        ];

        $scores = [];
        foreach ($toneKeywords as $tone => $keywords) {
            $scores[$tone] = 0;
            foreach ($keywords as $keyword) {
                if (Str::contains($verseText, $keyword)) {
                    $scores[$tone] += 1;
                }
            }
        }

        arsort($scores, SORT_NUMERIC);
        $topTone = (string) (array_key_first($scores) ?? 'comforting');
        return ($scores[$topTone] ?? 0) > 0 ? $topTone : 'comforting';
    }

    private function computeIntensity(string $rawText, array $themeScores, array $emotionScores): int
    {
        $base = (int) round(max(array_sum($themeScores), array_sum($emotionScores)));
        $punctuationBoost = preg_match_all('/[!?]/', $rawText) ?: 0;
        $wordCount = str_word_count($rawText);
        $lengthBoost = $wordCount >= 12 ? 1 : 0;
        $intensity = $base + $punctuationBoost + $lengthBoost;

        return max(1, min(5, $intensity));
    }

    private function roundScores(array $scores): array
    {
        return collect($scores)
            ->map(fn ($score) => round((float) $score, 2))
            ->all();
    }

    private function normalizeText(string $text): string
    {
        return (string) Str::of(Str::lower($text))
            ->replaceMatches('/[^a-z0-9\s]/', ' ')
            ->replaceMatches('/\s+/', ' ')
            ->trim();
    }

    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (Str::contains($haystack, Str::lower((string) $needle))) {
                return true;
            }
        }

        return false;
    }
}
