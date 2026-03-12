<?php

namespace App\Services\AI;

class AIContentAssistant
{
    /**
     * Generate a spiritual reflection or prayer prompt.
     * In a real app, this would call GPT, Claude, or a similar LLM.
     * Here we provide a set of intelligent templates as a robust fallback.
     */
    public function suggest(string $type, array $context = []): string
    {
        $prompts = [
            'reflection_prompt' => [
                "Bagaimana Anda melihat tangan Tuhan bekerja dalam kesulitan kecil minggu ini?",
                "Kapan terakhir kali Anda merasa sangat dekat dengan Tuhan saat sedang sendirian?",
                "Apa satu hal yang ingin Anda syukuri hari ini yang biasanya Anda anggap remeh?",
                "Bagaimana ayat hari ini mengubah cara Anda memandang rencana masa depan Anda?",
                "Jika Tuhan berbicara langsung kepada Anda pagi ini, pesan kasih apa yang menurut Anda Dia sampaikan?",
                "Dari ayat [REFERENCE], bagian mana yang paling menyentuh hati Anda hari ini?",
            ],
            'prayer_prompt' => [
                "Mari berdoa untuk setiap keluarga yang sedang bergumul dengan kesehatan mental.",
                "Berdoa bagi para penjangkau digital agar pesan kasih Tuhan sampai ke pelosok.",
                "Pokok doa: Keberanian untuk berbagi berkat kepada rekan kerja yang sedang sulit.",
                "Berdoa untuk kedamaian di hati setiap anggota komunitas kita malam ini.",
                "Sesuai pesan di [REFERENCE], mari kita doakan kekuatan bagi pelayanan kita.",
            ],
            'user_post' => [
                "Tuhan itu baik, bahkan saat keadaan tidak terlihat baik. Bersyukur untuk janji-Nya.",
                "Terberkati dengan diskusi hari ini di Sabbath School. Ada perspektif baru tentang kasih.",
            ]
        ];

        $list = $prompts[$type] ?? $prompts['reflection_prompt'];
        $suggestion = $list[array_rand($list)];

        // Simple context injection
        if (isset($context['reference'])) {
            $suggestion = str_replace('[REFERENCE]', $context['reference'], $suggestion);
        } else {
            // Fallback for missing reference
            $suggestion = str_replace('Dari ayat [REFERENCE], ', 'Hari ini, ', $suggestion);
            $suggestion = str_replace('Sesuai pesan di [REFERENCE], ', 'Mari kita ', $suggestion);
        }

        return $suggestion;
    }

    /**
     * Generate an opening comment to trigger social interaction.
     */
    public function generateIgnitionComment(\App\Models\MemberPost $post): string
    {
        $type = $post->type instanceof \App\Enums\PostType ? $post->type->value : (string) $post->type;

        $comments = [
            'reflection' => [
                "Ini sangat menguatkan. Menurut teman-teman, bagian mana yang paling relevan dengan situasi kita saat ini?",
                "Terima kasih sudah berbagi refleksi ini. Saya jadi terpikir, bagaimana kita bisa mempraktikkan ini besok?",
                "Amin! Ada yang punya pengalaman serupa minggu ini?",
            ],
            'prayer_request' => [
                "Saya ikut mengaminkan pokok doa ini. Mari kita bawa dalam doa bersama malam ini.",
                "Tuhan mendengar setiap seruan hati kita. Mari kita saling menguatkan dalam doa.",
            ],
            'quote' => [
                "Luar biasa dalam maknanya. Apa satu kata yang paling berkesan bagi Anda dari kutipan ini?",
                "Kutipan yang sangat relevan untuk mengawali hari. Selamat beraktivitas bagi semuanya!",
            ]
        ];

        $list = $comments[$type] ?? $comments['reflection'];

        return $list[array_rand($list)];
    }
}
