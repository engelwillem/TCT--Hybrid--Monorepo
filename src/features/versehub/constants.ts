"use client";

import type { MoodQuickStartOption, SanctuaryScene } from "./types";

export const landingContentPadding = "calc(340px + env(safe-area-inset-bottom, 32px))";
export const readerContentPadding = "calc(180px + env(safe-area-inset-bottom, 24px))";

export const SANCTUARY_SCENES: SanctuaryScene[] = [
    {
        eyebrow: "VerseHub",
        quote: "\"Let us not grow weary in doing good...\"",
        invitation: "Step in for a moment, steady your heart, then open Scripture with a quieter and deeper rhythm.",
        reflection: "VerseHub is more than a chapter list. It is a reading space that makes Scripture feel close, clear, and worth dwelling in.",
        moodTag: "hopeful",
        suggestedRoute: "explore",
    },
    {
        eyebrow: "Daily Manna",
        quote: "\"Your word is a lamp to my feet...\"",
        invitation: "Start with one small step. Choose your mood, open a book, and continue without losing context.",
        reflection: "When you are unsure where to begin, VerseHub offers a gentle starting point instead of noisy choices.",
        moodTag: "anxious",
        suggestedRoute: "explore",
    },
    {
        eyebrow: "Digital Prayer Room",
        quote: "\"Abide in Me...\"",
        invitation: "",
        reflection: "",
        moodTag: "weary",
        suggestedRoute: "explore",
    },
];

export const MOOD_QUICK_STARTS: MoodQuickStartOption[] = [
    {
        key: "anxious",
        label: "Anxious",
        description: "Open a calmer reading path.",
    },
    {
        key: "grateful",
        label: "Grateful",
        description: "Enter readings for gratitude and praise.",
    },
    {
        key: "weary",
        label: "Need Strength",
        description: "Find chapters that restore inner strength.",
    },
];

export function buildTodayDateLabel(): string {
    try {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        }).format(new Date()).toUpperCase();
    } catch {
        return "TODAY";
    }
}
