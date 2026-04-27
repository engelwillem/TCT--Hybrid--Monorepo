"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { EmotionalEntryState } from "@/features/ux-architecture/types";

interface SanctuaryState {
  reflectionText: string;
  entryState: EmotionalEntryState | null;
  initialMentorContext: string;
  ambientMoodKey: string;
  ambientMenuOpen: boolean;
  ambientIsDucking: boolean;
  ambientShouldShowChrome: boolean;
  ambientPlaybackStateHandler: ((payload: {
    isPlaying: boolean;
    moodKey: string;
    trackTitle?: string;
  }) => void) | null;
  setReflectionText: (text: string) => void;
  setEntryState: (state: EmotionalEntryState | null) => void;
  setInitialMentorContext: (text: string) => void;
  clearInitialMentorContext: () => void;
  setAmbientMoodKey: (value: string) => void;
  setAmbientMenuOpen: (value: boolean) => void;
  setAmbientIsDucking: (value: boolean) => void;
  setAmbientShouldShowChrome: (value: boolean) => void;
  setAmbientPlaybackStateHandler: (
    handler: ((payload: { isPlaying: boolean; moodKey: string; trackTitle?: string }) => void) | null
  ) => void;
}

const SanctuaryContext = createContext<SanctuaryState | undefined>(undefined);

export function SanctuaryProvider({ children }: { children: ReactNode }) {
  const [reflectionText, setReflectionText] = useState("");
  const [entryState, setEntryState] = useState<EmotionalEntryState | null>(null);
  const [initialMentorContext, setInitialMentorContext] = useState("");
  const [ambientMoodKey, setAmbientMoodKey] = useState("daily");
  const [ambientMenuOpen, setAmbientMenuOpen] = useState(false);
  const [ambientIsDucking, setAmbientIsDucking] = useState(false);
  const [ambientShouldShowChrome, setAmbientShouldShowChrome] = useState(true);
  const [ambientPlaybackStateHandler, setAmbientPlaybackStateHandler] = useState<((payload: {
    isPlaying: boolean;
    moodKey: string;
    trackTitle?: string;
  }) => void) | null>(null);

  const value = {
    reflectionText,
    entryState,
    initialMentorContext,
    ambientMoodKey,
    ambientMenuOpen,
    ambientIsDucking,
    ambientShouldShowChrome,
    ambientPlaybackStateHandler,
    setReflectionText,
    setEntryState,
    setInitialMentorContext,
    clearInitialMentorContext: () => setInitialMentorContext(""),
    setAmbientMoodKey,
    setAmbientMenuOpen,
    setAmbientIsDucking,
    setAmbientShouldShowChrome,
    setAmbientPlaybackStateHandler,
  };

  return (
    <SanctuaryContext.Provider value={value}>
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const context = useContext(SanctuaryContext);
  if (context === undefined) {
    throw new Error("useSanctuary must be used within a SanctuaryProvider");
  }
  return context;
}
