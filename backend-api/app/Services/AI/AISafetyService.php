<?php

namespace App\Services\AI;

class AISafetyService
{
    /**
     * Lightweight classifier for sensitive input.
     *
     * @return array{
     *   risk_level: 'low'|'medium'|'high',
     *   flags: array<int, string>,
     *   requires_human_support: bool,
     *   urgency: 'routine'|'watch'|'priority',
     *   detected_keywords: array<int, string>
     * }
     */
    public function classify(string $text): array
    {
        $normalized = mb_strtolower(trim($text));
        if ($normalized === '') {
            return [
                'risk_level' => 'low',
                'flags' => [],
                'requires_human_support' => false,
                'urgency' => 'routine',
                'detected_keywords' => [],
            ];
        }

        $rules = [
            'self_harm' => ['bunuh diri', 'akhiri hidup', 'mati saja', 'self harm', 'suicide', 'menyakiti diri', 'luka diri'],
            'hopelessness' => ['tidak ada harapan', 'putus asa', 'nggak sanggup hidup', 'hopeless', 'hidup tidak ada artinya'],
            'abuse_violence' => ['dipukul', 'kekerasan', 'abuse', 'violence', 'dianiaya', 'dipaksa', 'pelecehan'],
            'crisis_signal' => ['ingin menghilang', 'tidak kuat lagi', 'tidak mau hidup', 'sudah selesai', 'tidak sanggup lanjut'],
        ];

        $flags = [];
        $matchedKeywords = [];
        foreach ($rules as $flag => $needles) {
            foreach ($needles as $needle) {
                if (str_contains($normalized, $needle)) {
                    $flags[] = $flag;
                    $matchedKeywords[] = $needle;
                    break;
                }
            }
        }

        $flags = array_values(array_unique($flags));
        $matchedKeywords = array_values(array_unique($matchedKeywords));

        $hasHighRiskCluster = in_array('self_harm', $flags, true) || in_array('crisis_signal', $flags, true);
        $riskLevel = $hasHighRiskCluster || count($flags) >= 2
            ? 'high'
            : (count($flags) === 1 ? 'medium' : 'low');

        $urgency = $riskLevel === 'high'
            ? 'priority'
            : ($riskLevel === 'medium' ? 'watch' : 'routine');

        return [
            'risk_level' => $riskLevel,
            'flags' => $flags,
            'requires_human_support' => $riskLevel !== 'low',
            'urgency' => $urgency,
            'detected_keywords' => $matchedKeywords,
        ];
    }
}
