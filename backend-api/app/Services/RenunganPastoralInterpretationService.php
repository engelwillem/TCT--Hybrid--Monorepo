<?php

namespace App\Services;

use App\Models\BibleVerse;
use App\Models\VersePastoralNote;
use App\Models\VerseThemeMapping;
use App\Models\VerseToneMapping;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class RenunganPastoralInterpretationService
{
    /**
     * @return array<string, mixed>
     */
    public function buildInterpretation(array $selectedVerses, array $analysis, string $reflectionText, string $lang = 'id'): array
    {
        /** @var ?BibleVerse $verse */
        $verse = $selectedVerses[0] ?? null;
        $verseRef = $this->toVerseRef($verse);
        $primaryTheme = (string) ($analysis['primary_theme'] ?? 'guidance');
        $primaryEmotion = (string) ($analysis['primary_emotion'] ?? 'confused');
        $preferredTone = (string) ($analysis['preferred_verse_tone'] ?? 'comforting');
        $analysisTone = (string) ($analysis['tone'] ?? '');
        $contextFlags = (array) ($analysis['context_flags'] ?? []);

        $themeTags = $verseRef !== null
            ? VerseThemeMapping::query()
                ->where('verse_ref', $verseRef)
                ->where('lang', $lang)
                ->orderBy('sort_order')
                ->pluck('theme_slug')
                ->all()
            : [];

        $toneTags = $verseRef !== null
            ? VerseToneMapping::query()
                ->where('verse_ref', $verseRef)
                ->where('lang', $lang)
                ->orderByDesc('weight')
                ->pluck('tone_slug')
                ->all()
            : [];

        if (! in_array($preferredTone, $toneTags, true)) {
            $toneTags[] = $preferredTone;
        }
        $toneTags = array_values(array_filter(array_unique($toneTags)));

        $note = $this->pickBestNote(
            $verseRef,
            $lang,
            $primaryTheme,
            $primaryEmotion,
            $preferredTone,
            $toneTags,
            $contextFlags
        );

        if ($note === null) {
            return [
            'source' => 'fallback',
            'verse_ref' => $verseRef ?? '',
            'verse_main_message' => $this->inferMainMessage($primaryTheme),
            'pastoral_theme' => $primaryTheme,
            'tone' => $preferredTone,
            'pastoral_application' => $this->inferApplication($primaryTheme),
            'comfort_direction' => $this->inferComfortDirection($primaryTheme, $contextFlags),
            'correction_direction' => $this->inferCorrectionDirection($primaryTheme, $contextFlags),
            'hope_direction' => $this->inferHopeDirection($primaryTheme),
            'prayer_direction' => $this->inferPrayerDirection($primaryTheme),
            'de_escalation_direction' => $this->inferDeEscalationDirection($primaryTheme, $contextFlags),
            'theme_tags' => $themeTags,
            'tone_tags' => array_values(array_filter(array_unique(array_merge($toneTags, array_filter([$analysisTone]))))),
            'audience_language_notes' => 'Bahasa Indonesia sederhana, hangat, non-akademik, mudah dipahami lintas usia.',
            'input_echo' => trim((string) Str::of($reflectionText)->replaceMatches('/\s+/', ' ')->limit(120, '')),
            // Backward compatibility keys.
            'verse_pastoral_theme' => $primaryTheme,
            'verse_tone' => $preferredTone,
            'verse_theme_tags' => $themeTags,
            'verse_tone_tags' => $toneTags,
            ];
        }

        $selectedTone = (string) ($note->tone_slug ?: ($toneTags[0] ?? $preferredTone));

        return [
            'source' => 'pastoral_note',
            'verse_ref' => $verseRef ?? '',
            'verse_main_message' => (string) $note->main_message,
            'pastoral_theme' => (string) ($note->theme_slug ?: $primaryTheme),
            'tone' => $selectedTone,
            'pastoral_application' => (string) ($note->application_text ?: $note->pastoral_angle ?: $this->inferApplication($primaryTheme)),
            'comfort_direction' => $this->inferComfortDirection($primaryTheme, $contextFlags),
            'correction_direction' => (string) ($note->correction_direction ?: $this->inferCorrectionDirection($primaryTheme, $contextFlags)),
            'hope_direction' => (string) ($note->hope_text ?: $this->inferHopeDirection($primaryTheme)),
            'prayer_direction' => (string) ($note->prayer_direction ?: $this->inferPrayerDirection($primaryTheme)),
            'de_escalation_direction' => (string) ($note->de_escalation_direction ?: $this->inferDeEscalationDirection($primaryTheme, $contextFlags)),
            'theme_tags' => array_values(array_filter(array_unique(array_merge($themeTags, [(string) $note->theme_slug])))),
            'tone_tags' => array_values(array_filter(array_unique(array_merge($toneTags, [$selectedTone], array_filter([$analysisTone]))))),
            'audience_language_notes' => (string) ($note->language_style ?: 'plain'),
            'input_echo' => trim((string) Str::of($reflectionText)->replaceMatches('/\s+/', ' ')->limit(120, '')),
            // Backward compatibility keys.
            'verse_pastoral_theme' => (string) ($note->theme_slug ?: $primaryTheme),
            'verse_tone' => $selectedTone,
            'verse_theme_tags' => array_values(array_filter(array_unique(array_merge($themeTags, [(string) $note->theme_slug])))),
            'verse_tone_tags' => array_values(array_filter(array_unique(array_merge($toneTags, [$selectedTone])))),
        ];
    }

    private function toVerseRef(?BibleVerse $verse): ?string
    {
        if ($verse === null || empty($verse->book_code) || empty($verse->chapter) || empty($verse->verse)) {
            return null;
        }

        return Str::lower((string) $verse->book_code).'-'.(int) $verse->chapter.'-'.(int) $verse->verse;
    }

    /**
     * @param array<int, string> $toneTags
     * @param array<string, bool> $contextFlags
     */
    private function pickBestNote(
        ?string $verseRef,
        string $lang,
        string $primaryTheme,
        string $primaryEmotion,
        string $preferredTone,
        array $toneTags,
        array $contextFlags
    ): ?VersePastoralNote {
        $query = VersePastoralNote::query()
            ->where('is_active', true)
            ->where('lang', $lang)
            ->where(function ($q) use ($verseRef, $primaryTheme): void {
                if ($verseRef !== null) {
                    $q->orWhere('verse_ref', $verseRef);
                }
                $q->orWhere('theme_slug', $primaryTheme);
            });

        /** @var Collection<int, VersePastoralNote> $notes */
        $notes = $query->get();
        if ($notes->isEmpty()) {
            return null;
        }

        return $notes
            ->map(function (VersePastoralNote $note) use ($verseRef, $primaryTheme, $primaryEmotion, $preferredTone, $toneTags, $contextFlags) {
                $score = (float) $note->priority;

                if ($verseRef !== null && $note->verse_ref === $verseRef) {
                    $score += 32;
                }
                if ($note->theme_slug === $primaryTheme) {
                    $score += 16;
                } elseif ($note->theme_slug === null) {
                    $score += 2;
                }

                if ($note->tone_slug === $preferredTone) {
                    $score += 10;
                } elseif ($note->tone_slug !== null && in_array($note->tone_slug, $toneTags, true)) {
                    $score += 6;
                }

                if (($contextFlags['has_harm_terms'] ?? false) && ! empty($note->de_escalation_direction)) {
                    $score += 12;
                }
                if (($contextFlags['has_anger_terms'] ?? false) && in_array((string) $note->tone_slug, ['restraining', 'corrective'], true)) {
                    $score += 9;
                }
                if (($contextFlags['has_longing_terms'] ?? false) && ($contextFlags['has_family_terms'] ?? false) && $note->theme_slug === 'longing_family') {
                    $score += 7;
                }
                if ($primaryEmotion === 'hostile' && (string) $note->tone_slug === 'comforting') {
                    $score -= 4;
                }

                return ['note' => $note, 'score' => $score];
            })
            ->sortByDesc('score')
            ->pluck('note')
            ->first();
    }

    private function inferMainMessage(string $theme): string
    {
        return match ($theme) {
            'gratitude' => 'Syukur menolong hati melihat kesetiaan Tuhan dengan jernih.',
            'longing_family' => 'Kerinduan dalam jarak tetap berada dalam penjagaan Tuhan.',
            'ministry_disillusionment', 'church_hurt', 'calling_conflict', 'exploitation', 'institutional_disappointment', 'authority_wound', 'mixed_emotional_state' => 'Tuhan hadir di tengah luka pelayanan dan menuntun langkah pulih dengan hikmat.',
            'anxiety' => 'Tuhan memanggil hati yang cemas untuk kembali tenang dalam-Nya.',
            'fatigue' => 'Tuhan memberi ruang pemulihan bagi jiwa yang letih.',
            'guilt', 'repentance' => 'Pengakuan yang jujur membuka jalan pemulihan.',
            'anger_conflict', 'hatred_hostility' => 'Kemarahan perlu ditata dalam terang Tuhan agar tidak melukai.',
            default => 'Tuhan menuntunmu melangkah dengan hikmat dan damai.',
        };
    }

    private function inferApplication(string $theme): string
    {
        return match ($theme) {
            'gratitude' => 'Sebutkan berkat Tuhan hari ini dan responsi dengan hidup yang rendah hati.',
            'longing_family' => 'Bawa nama orang yang kamu rindukan dalam doa harian dengan setia.',
            'ministry_disillusionment', 'church_hurt', 'calling_conflict', 'exploitation', 'institutional_disappointment', 'authority_wound', 'mixed_emotional_state' => 'Pulihkan hati terlebih dahulu, tetapkan batas sehat, lalu melangkah dengan keputusan yang jujur di hadapan Tuhan.',
            'anxiety' => 'Pisahkan beban yang bisa kamu kerjakan hari ini dari yang perlu kamu serahkan pada Tuhan.',
            'fatigue' => 'Ambil ritme istirahat yang sehat dan lanjutkan langkah kecil dengan iman.',
            'guilt', 'repentance' => 'Akui dengan jujur, tinggalkan pola lama, lalu melangkah dalam pemulihan.',
            'anger_conflict', 'hatred_hostility' => 'Tahan reaksi spontan, tenangkan diri, lalu pilih respons yang membangun.',
            default => 'Lakukan langkah sederhana yang benar hari ini, sambil terus meminta hikmat Tuhan.',
        };
    }

    /**
     * @param array<string, bool> $contextFlags
     */
    private function inferComfortDirection(string $theme, array $contextFlags): string
    {
        if (($contextFlags['has_longing_terms'] ?? false) && ($contextFlags['has_family_terms'] ?? false)) {
            return 'Tuhan menyertaimu di tempat ini dan menjaga orang-orang yang kamu kasihi.';
        }

        return match ($theme) {
            'ministry_disillusionment', 'church_hurt', 'calling_conflict', 'exploitation', 'institutional_disappointment', 'authority_wound', 'mixed_emotional_state' => 'Tuhan tidak menyepelekan lukamu; Ia menuntunmu memulihkan hati tanpa kehilangan arah.',
            'anger_conflict', 'hatred_hostility' => 'Tuhan mengerti emosimu, dan Ia memimpinmu agar tidak dikuasai amarah.',
            default => 'Tuhan tetap dekat dan tidak meninggalkanmu pada musim ini.',
        };
    }

    /**
     * @param array<string, bool> $contextFlags
     */
    private function inferCorrectionDirection(string $theme, array $contextFlags): ?string
    {
        if (($contextFlags['has_harm_terms'] ?? false) || in_array($theme, ['anger_conflict', 'hatred_hostility', 'guilt', 'repentance'], true)) {
            return 'Pilih jalan yang benar: hindari kata-kata melukai, jauhi balas dendam, dan serahkan penghakiman kepada Tuhan.';
        }

        return null;
    }

    private function inferHopeDirection(string $theme): string
    {
        return match ($theme) {
            'longing_family' => 'Tuhan sanggup menjaga kasih tetap hidup sampai waktunya perjumpaan.',
            'ministry_disillusionment', 'church_hurt', 'calling_conflict', 'exploitation', 'institutional_disappointment', 'authority_wound', 'mixed_emotional_state' => 'Tuhan masih sanggup membuka jalan panggilan yang sehat setelah musim luka ini.',
            'anger_conflict', 'hatred_hostility' => 'Dengan pertolongan Tuhan, kemarahanmu bisa diubah menjadi kedewasaan dan damai.',
            default => 'Pengharapanmu bisa bertumbuh lagi karena Tuhan setia menuntunmu.',
        };
    }

    private function inferPrayerDirection(string $theme): string
    {
        return match ($theme) {
            'anxiety' => 'Doakan: Tuhan, tenangkan hatiku dan tuntun langkahku hari ini.',
            'fatigue' => 'Doakan kekuatan baru agar kamu dapat melanjutkan langkah dengan damai.',
            'ministry_disillusionment', 'church_hurt', 'calling_conflict', 'exploitation', 'institutional_disappointment', 'authority_wound', 'mixed_emotional_state' => 'Doakan: Tuhan, sembuhkan lukaku, jernihkan pikiranku, dan tuntun aku memilih langkah yang benar.',
            'anger_conflict', 'hatred_hostility' => 'Doakan: Tuhan, jaga lidahku, lembutkan hatiku, dan pimpin aku memilih damai.',
            default => 'Tutup hari ini dengan doa singkat yang jujur, lalu percayakan hasilnya kepada Tuhan.',
        };
    }

    /**
     * @param array<string, bool> $contextFlags
     */
    private function inferDeEscalationDirection(string $theme, array $contextFlags): ?string
    {
        if (($contextFlags['has_harm_terms'] ?? false) || in_array($theme, ['anger_conflict', 'hatred_hostility'], true)) {
            return 'Jika emosi sedang tinggi, ambil jeda, turunkan intensitas, dan bicara kembali saat hati lebih tenang.';
        }

        return null;
    }
}
