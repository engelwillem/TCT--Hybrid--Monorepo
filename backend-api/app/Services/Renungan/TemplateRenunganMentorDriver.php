<?php

namespace App\Services\Renungan;

use Illuminate\Support\Str;

class TemplateRenunganMentorDriver implements RenunganMentorDriverInterface
{
    public function generate(array $context): array
    {
        $reflection = trim((string) ($context['reflection_text'] ?? ''));
        $legacyMeditation = trim((string) ($context['legacy_meditation'] ?? ''));
        $verseReference = trim((string) ($context['verse_reference'] ?? 'Mazmur 55:23'));
        $analysis = (array) ($context['analysis'] ?? []);

        $theme = (string) ($analysis['primary_theme'] ?? 'direction');
        $emotion = (string) ($analysis['primary_emotion'] ?? 'confused');
        $intent = (string) ($analysis['intent'] ?? 'guidance');
        $responseMode = (string) ($context['response_mode'] ?? 'calm_heart');
        $shortReflection = Str::limit(
            preg_replace('/\s+/', ' ', $reflection) ?? $reflection,
            120,
            '…'
        );

        $followUp = match ($theme) {
            'anxiety' => 'Dari semua bebanmu hari ini, mana yang perlu kamu serahkan dulu dalam doa?',
            'fatigue' => 'Langkah istirahat sehat apa yang bisa kamu pilih hari ini sebagai wujud iman?',
            'guilt', 'repentance' => 'Pengakuan jujur apa yang ingin kamu bawa kepada Tuhan sekarang?',
            'anger_conflict', 'hatred_hostility' => 'Respons damai apa yang bisa kamu pilih agar tidak melukai diri sendiri maupun orang lain?',
            default => 'Langkah kecil apa yang paling realistis untuk kamu lakukan hari ini bersama Tuhan?',
        };

        $safetyNotes = [];
        $flags = (array) ($analysis['context_flags'] ?? []);
        if (($flags['has_harm_terms'] ?? false) || in_array($theme, ['anger_conflict', 'hatred_hostility'], true)) {
            $safetyNotes[] = 'Jika emosi terasa memuncak, ambil jeda, bernapas perlahan, dan cari teman/mentor rohani tepercaya untuk mendampingi.';
        }
        if (($flags['has_church_hurt_terms'] ?? false) || ($flags['has_authority_wound_terms'] ?? false)) {
            $safetyNotes[] = 'Kamu berhak menata batas sehat sambil tetap menjaga hati agar tidak dikuasai kepahitan.';
        }

        $modeMeditation = match ($responseMode) {
            'short_prayer' => "Tuhan, di tengah {$intent} ini, tenangkan hatiku, tuntun langkahku, dan jagai pikiranku dalam damai-Mu.",
            'practical_step' => 'Hari ini pilih satu langkah kecil yang jujur: tenangkan diri, berdoa singkat, lalu lakukan keputusan paling benar yang bisa kamu kerjakan sekarang.',
            'deep_reflection' => "Dalam {$verseReference}, Tuhan tidak menolak hatimu yang rapuh. Ia mengundangmu memandang situasi ini bukan dari panik, melainkan dari kasih yang setia.",
            default => null,
        };

        return [
            'mentor_opening' => $shortReflection !== ''
                ? "Terima kasih sudah jujur. Saya menangkap pergumulanmu: {$shortReflection}"
                : 'Terima kasih sudah membuka hati. Mari kita jalani renungan ini pelan-pelan.',
            'meditation' => $modeMeditation
                ?: ($legacyMeditation !== ''
                    ? $legacyMeditation
                    : "Dalam {$verseReference}, Tuhan mengundangmu untuk melangkah dengan tenang dan jujur di hadapan-Nya."),
            'prayer_prompt' => "Tuhan, tuntun aku menanggapi {$intent} dengan hati yang lembut, jernih, dan taat.",
            'follow_up_question' => $followUp,
            'confidence' => in_array($emotion, ['hostile', 'angry'], true) ? 'medium' : 'high',
            'safety_notes' => $safetyNotes,
            'request_id' => null,
        ];
    }
}
