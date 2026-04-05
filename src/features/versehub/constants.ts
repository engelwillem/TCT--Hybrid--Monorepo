"use client";

import type { MoodQuickStartOption, SanctuaryScene } from "./types";

export const landingContentPadding = "calc(240px + env(safe-area-inset-bottom, 24px))";
export const readerContentPadding = "calc(180px + env(safe-area-inset-bottom, 24px))";

export const SANCTUARY_SCENES: SanctuaryScene[] = [
    {
        eyebrow: "VerseHub",
        quote: "\"Janganlah kita jemu-jemu berbuat baik...\"",
        invitation: "Masuk sebentar, tenangkan hati, lalu buka firman dengan ritme yang lebih pelan.",
        reflection: "Hari ini bukan tentang buru-buru menyelesaikan bacaan, tetapi tentang memberi ruang bagi firman untuk berbicara.",
        moodTag: "hopeful",
        suggestedRoute: "explore",
    },
    {
        eyebrow: "Daily Mana",
        quote: "\"Firman-Mu itu pelita bagi kakiku...\"",
        invitation: "Mulai dari satu langkah kecil. Explore akan membawa Anda masuk ke kitab dan pasal yang ingin dibaca.",
        reflection: "VerseHub dirancang seperti ruang doa digital: satu layar untuk menerima, lalu satu jalur untuk masuk lebih dalam.",
        moodTag: "anxious",
        suggestedRoute: "explore",
    },
    {
        eyebrow: "Ruang Doa Digital",
        quote: "\"Tinggallah di dalam Aku...\"",
        invitation: "Pilih jalur baca, nyalakan ambience, dan biarkan scripture guide menemani saat Anda masuk ke ayat.",
        reflection: "Koleksi kitab, ambience Lagusion, dan mentor internal bekerja sebagai satu pengalaman, bukan panel-panel yang terpisah.",
        moodTag: "weary",
        suggestedRoute: "explore",
    },
];

export const MOOD_QUICK_STARTS: MoodQuickStartOption[] = [
    {
        key: "anxious",
        label: "Cemas",
        description: "Buka jalur yang lebih menenangkan.",
    },
    {
        key: "grateful",
        label: "Bersyukur",
        description: "Masuk ke bacaan syukur dan pujian.",
    },
    {
        key: "weary",
        label: "Butuh Kekuatan",
        description: "Temukan pasal yang memulihkan tenaga batin.",
    },
];

export function buildTodayDateLabel(): string {
    try {
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        }).format(new Date()).toUpperCase();
    } catch {
        return "HARI INI";
    }
}
