<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BibleVerse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RenunganPersonalizationController extends Controller
{
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
        $selected = $this->selectCorrelatedVerses($candidates, $searchTerms, $analysis);

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
        $normalized = Str::lower($text);

        $themeProfiles = [
            'anxiety' => [
                'keywords' => ['cemas', 'khawatir', 'takut', 'gelisah', 'panik', 'deg-degan'],
                'emotional_need' => 'ketenangan',
                'spiritual_need' => 'percaya pemeliharaan Tuhan',
                'intent' => 'mencari rasa aman',
            ],
            'fatigue' => [
                'keywords' => ['lelah', 'capek', 'penat', 'burnout', 'letih', 'habis tenaga'],
                'emotional_need' => 'kelegaan',
                'spiritual_need' => 'kekuatan baru',
                'intent' => 'butuh pemulihan',
            ],
            'guilt' => [
                'keywords' => ['dosa', 'bersalah', 'malu', 'jatuh', 'gagal', 'ampun'],
                'emotional_need' => 'diterima kembali',
                'spiritual_need' => 'pengampunan dan pemulihan',
                'intent' => 'ingin dipulihkan',
            ],
            'direction' => [
                'keywords' => ['bingung', 'keputusan', 'jalan', 'masa depan', 'pilihan', 'rencana'],
                'emotional_need' => 'kejelasan',
                'spiritual_need' => 'hikmat dan tuntunan',
                'intent' => 'mencari arah',
            ],
            'relationship' => [
                'keywords' => ['keluarga', 'suami', 'istri', 'anak', 'rumah', 'hubungan', 'orang tua'],
                'emotional_need' => 'rekonsiliasi',
                'spiritual_need' => 'kasih dan kesabaran',
                'intent' => 'memulihkan relasi',
            ],
            'finance_work' => [
                'keywords' => ['kerja', 'pekerjaan', 'uang', 'finansial', 'tagihan', 'usaha', 'karier'],
                'emotional_need' => 'pengharapan',
                'spiritual_need' => 'iman dalam proses',
                'intent' => 'bertahan dalam tekanan',
            ],
            'loneliness' => [
                'keywords' => ['sendiri', 'kesepian', 'ditinggal', 'tidak ada teman', 'hampa'],
                'emotional_need' => 'ditemani',
                'spiritual_need' => 'kesadaran kehadiran Tuhan',
                'intent' => 'ingin ditemani',
            ],
            'gratitude' => [
                'keywords' => ['bersyukur', 'terima kasih', 'puji Tuhan', 'sukacita'],
                'emotional_need' => 'syukur yang stabil',
                'spiritual_need' => 'hati yang menyembah',
                'intent' => 'memelihara ucapan syukur',
            ],
        ];

        $scores = [];
        foreach ($themeProfiles as $theme => $profile) {
            $score = 0;
            foreach ($profile['keywords'] as $keyword) {
                if (Str::contains($normalized, $keyword)) {
                    $score += 1;
                }
            }
            if ($score > 0) {
                $scores[$theme] = $score;
            }
        }

        arsort($scores);
        $topThemes = array_slice(array_keys($scores), 0, 2);
        $primaryTheme = $topThemes[0] ?? 'direction';

        $selectedProfile = $themeProfiles[$primaryTheme];

        return [
            'primary_theme' => $primaryTheme,
            'secondary_themes' => array_values(array_slice($topThemes, 1)),
            'emotional_need' => $selectedProfile['emotional_need'],
            'spiritual_need' => $selectedProfile['spiritual_need'],
            'intent' => $selectedProfile['intent'],
        ];
    }

    private function buildSearchTerms(string $text, array $analysis): array
    {
        $normalized = Str::of(Str::lower($text))
            ->replaceMatches('/[^a-z0-9\s]/', ' ')
            ->replaceMatches('/\s+/', ' ')
            ->trim()
            ->value();

        $tokens = collect(explode(' ', $normalized))
            ->filter(fn (string $token) => strlen($token) >= 4)
            ->reject(fn (string $token) => in_array($token, [
                'yang', 'dengan', 'untuk', 'dalam', 'sudah', 'akan', 'saya', 'kami', 'kamu', 'dari', 'karena', 'tetapi',
            ], true))
            ->take(8)
            ->values()
            ->all();

        $themeHintMap = [
            'anxiety' => ['jangan takut', 'kuatir', 'damai', 'tenang'],
            'fatigue' => ['lelah', 'kekuatan', 'istirahat', 'dipulihkan'],
            'guilt' => ['ampun', 'kasih setia', 'pemulihan', 'anugerah'],
            'direction' => ['hikmat', 'tuntunan', 'jalan', 'percaya'],
            'relationship' => ['kasih', 'sabar', 'mengampuni', 'damai sejahtera'],
            'finance_work' => ['pemeliharaan', 'mencukupkan', 'setia', 'harapan'],
            'loneliness' => ['menyertai', 'hadirat', 'dekat', 'penghiburan'],
            'gratitude' => ['bersyukur', 'memuji', 'setia', 'sukacita'],
        ];

        $themeTerms = $themeHintMap[$analysis['primary_theme'] ?? 'direction'] ?? ['percaya', 'pengharapan'];

        return collect(array_merge($tokens, $themeTerms))
            ->map(fn (string $term) => trim($term))
            ->filter()
            ->unique()
            ->take(12)
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

    private function selectCorrelatedVerses($candidates, array $searchTerms, array $analysis): array
    {
        if ($candidates->isEmpty()) {
            return [];
        }

        $normalizedTerms = collect($searchTerms)->map(fn (string $term) => Str::lower($term))->all();
        $primaryTheme = (string) ($analysis['primary_theme'] ?? '');

        $scored = $candidates
            ->map(function (BibleVerse $verse) use ($normalizedTerms, $primaryTheme) {
                $text = Str::lower((string) $verse->text);
                $score = 0;

                foreach ($normalizedTerms as $term) {
                    if ($term !== '' && Str::contains($text, $term)) {
                        $score += 8;
                    }
                }

                $bookBoost = match ($primaryTheme) {
                    'anxiety' => ['mzm', 'mat', 'yes', 'flp'],
                    'fatigue' => ['yes', 'mat', 'mzm'],
                    'guilt' => ['1yoh', 'mzm', 'rom'],
                    'direction' => ['ams', 'mzm', 'yes', 'yoh'],
                    'relationship' => ['ef', 'kol', '1kor', 'mzm'],
                    'finance_work' => ['mat', 'flp', 'mzm', 'ams'],
                    'loneliness' => ['mzm', 'yes', 'ibr', 'yoh'],
                    'gratitude' => ['mzm', '1tes', 'kol'],
                    default => ['mzm', 'mat', 'yoh'],
                };

                if (in_array((string) $verse->book_code, $bookBoost, true)) {
                    $score += 10;
                }

                if (Str::contains($text, 'jangan takut') || Str::contains($text, 'jangan khawatir')) {
                    $score += 4;
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
        $mainPainPoint = trim(
            Str::of($reflectionText)
                ->replaceMatches('/\s+/', ' ')
                ->limit(110, '...')
                ->value()
        );

        $verseEchoes = collect($selectedVerses)
            ->map(fn (BibleVerse $verse) => Str::of((string) $verse->text)->limit(70, '...')->value())
            ->filter()
            ->take(2)
            ->values()
            ->all();

        $echoText = '';
        if (!empty($verseEchoes)) {
            $echoText = ' Firman meneguhkan bahwa '.implode(' Juga diingatkan bahwa ', $verseEchoes).'.';
        }

        $emotionalNeed = (string) ($analysis['emotional_need'] ?? 'ketenangan');
        $spiritualNeed = (string) ($analysis['spiritual_need'] ?? 'pengharapan');

        return trim(
            "Tuhan melihat pergumulanmu saat kamu berkata, \"{$mainPainPoint}\". ".
            "Di titik ini, kamu sedang butuh {$emotionalNeed}; dan Tuhan sedang menuntunmu kepada {$spiritualNeed}.".
            $echoText.
            " Kamu tidak berjalan sendiri, dan langkah kecilmu hari ini tetap berharga di hadapan-Nya."
        );
    }
}

