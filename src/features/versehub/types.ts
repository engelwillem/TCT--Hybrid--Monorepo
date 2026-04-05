"use client";

export type Book = {
    code: string;
    label: string;
    testament: "ot" | "nt";
};

export type Verse = {
    key: string;
    verse: number;
    text: string;
};

export type ChapterPayload = {
    selected_book?: string | null;
    selected_chapter?: number | null;
    chapters?: number[];
    chapter_label?: string;
    verses?: Verse[];
    reflection_question?: string;
    has_reflected?: boolean;
};

export type VerseData = {
    ref: string;
    reference: string;
    text: string;
    translation_name: string | null;
    provider: string | null;
    og_image_url: string;
    canonical_url: string;
};

export type OverlayType = "explore" | "picker" | "mentor" | "audio" | null;

export type SanctuaryScene = {
    eyebrow: string;
    quote: string;
    invitation: string;
    reflection: string;
    moodTag: string;
    suggestedRoute: string;
};

export type MoodQuickStartOption = {
    key: string;
    label: string;
    description: string;
};
