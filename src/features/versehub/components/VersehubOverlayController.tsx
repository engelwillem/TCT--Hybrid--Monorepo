"use client";

import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AmbienceController from "@/components/versehub/AmbienceController";
import MentorPanel from "@/components/versehub/MentorPanel";
import { VersehubControlCenter, type ControlCenterItem } from "@/features/versehub/components/VersehubControlCenter";
import { cn } from "@/lib/utils";
import type { Book, OverlayType, SanctuaryScene, Verse, VerseData } from "@/features/versehub/types";

interface VersehubOverlayControllerProps {
  activeBook: string | null;
  activeBookLabel: string | null;
  activeMood: string;
  activeScene: SanctuaryScene;
  audioMenuOpen: boolean;
  books: Book[];
  chapters: number[];
  controlCenterOpen: boolean;
  error: string | null;
  firstBookLabel: string;
  firstChapterHref: string | null;
  floatingMenuItems: ControlCenterItem[];
  handleAmbienceMenuOpen: (isOpen: boolean) => void;
  handlePlaybackStateChange: (args: { isPlaying: boolean; moodKey: string; trackTitle?: string }) => void;
  isLandingMode: boolean;
  lang: string;
  loadBookChapters: (bookCode: string) => Promise<void>;
  mentorMood: string;
  mentorPreviewLabel: string | null;
  mentorPreviewVerse: Verse | null;
  ogOpen: boolean;
  onNavigate: (href: string) => void;
  onToggleControlCenter: () => void;
  overlay: OverlayType;
  selectedVerseReflection: string | null;
  setActiveMood: Dispatch<SetStateAction<string>>;
  setOgOpen: Dispatch<SetStateAction<boolean>>;
  setOverlay: Dispatch<SetStateAction<OverlayType>>;
  setTab: Dispatch<SetStateAction<"ot" | "nt">>;
  shouldShowChrome: boolean;
  tab: "ot" | "nt";
  verseData: VerseData | null;
}

export function VersehubOverlayController({
  activeBook,
  activeBookLabel,
  activeMood,
  activeScene,
  audioMenuOpen,
  books,
  chapters,
  controlCenterOpen,
  error,
  firstBookLabel,
  firstChapterHref,
  floatingMenuItems,
  handleAmbienceMenuOpen,
  handlePlaybackStateChange,
  isLandingMode,
  lang,
  loadBookChapters,
  mentorMood,
  mentorPreviewLabel,
  mentorPreviewVerse,
  ogOpen,
  onNavigate,
  onToggleControlCenter,
  overlay,
  selectedVerseReflection,
  setActiveMood,
  setOgOpen,
  setOverlay,
  setTab,
  shouldShowChrome,
  tab,
  verseData,
}: VersehubOverlayControllerProps) {
  return (
    <>
      <AnimatePresence>
        {overlay === "explore" && (
          <div className="fixed inset-0 z-[60]">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOverlay(null)}
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl rounded-t-[36px] glass-panel px-6 pt-6 pb-[calc(24px+env(safe-area-inset-bottom,24px))] shadow-[0_-30px_80px_rgba(15,23,42,0.18)] md:left-1/2 md:max-w-2xl md:-translate-x-1/2 md:pb-6"
            >
              <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-foreground/10" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#91A0C7]">Deep Dive</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">Masuk ke firman tanpa kehilangan rasa heningnya.</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOverlay(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/50 transition hover:bg-foreground/10 active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-4 text-sm leading-7 text-foreground/65">{activeScene.reflection}</p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOverlay("picker")}
                  className="rounded-[26px] bg-[var(--vh-surface)]/80 p-4 text-left ring-1 ring-[var(--vh-border)] transition hover:bg-[var(--vh-surface)] active:scale-[0.98]"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Koleksi Kitab</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-[var(--vh-text-primary)]">Buka Perjanjian Lama dan Baru</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                    Masuk ke daftar kitab, lalu pilih pasal yang ingin Anda baca dengan flow yang lebih tenang.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!firstChapterHref}
                  onClick={() => {
                    if (!firstChapterHref) return;
                    setOverlay(null);
                    onNavigate(firstChapterHref);
                  }}
                  className="rounded-[26px] bg-[var(--vh-surface)]/80 p-4 text-left ring-1 ring-[var(--vh-border)] transition hover:bg-[var(--vh-surface)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Jalur Cepat</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-[var(--vh-text-primary)]">Mulai dari {firstBookLabel} 1</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                    Cocok untuk langsung masuk ke reader utilitarian tanpa kehilangan transisi dari landing.
                  </p>
                </button>

                <div className="rounded-[26px] bg-[var(--vh-surface)]/80 p-4 text-left ring-1 ring-[var(--vh-border)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Lagusion Companion</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-[var(--vh-text-primary)]">Vocal dan audio-only tetap tersedia</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                    Floating audio companion akan menemani bacaan Anda dengan pilihan vocal, piano, acoustic, atau instrumental.
                  </p>
                </div>

                <div className="rounded-[26px] bg-[var(--vh-surface)]/80 p-4 text-left ring-1 ring-[var(--vh-border)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Atur Atmosfer</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-[var(--vh-text-primary)]">Pilih Mood Saat Ini</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { key: "hopeful", label: "Cahaya" },
                      { key: "anxious", label: "Ketenangan" },
                      { key: "weary", label: "Lelah" },
                      { key: "grateful", label: "Syukur" },
                    ].map((mood) => (
                      <button
                        key={mood.key}
                        onClick={() => setActiveMood(mood.key)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition",
                          activeMood === mood.key
                            ? "bg-[var(--vh-accent)] text-white"
                            : "bg-[var(--vh-surface-elevated)] text-[var(--vh-text-secondary)] ring-1 ring-[var(--vh-border)] hover:bg-[var(--vh-surface)]"
                        )}
                      >
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] bg-[var(--vh-surface)]/80 p-4 text-left ring-1 ring-[var(--vh-border)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">Mentor Internal</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-[var(--vh-text-primary)]">Scripture guide aktif saat ayat dibuka</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--vh-text-secondary)]">
                    Mentor menarik refleksi, kaitan ayat, konteks, dan study guidance dari engine Laravel internal dengan metadata penuh.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overlay === "picker" && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOverlay(null)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              className="relative flex h-[min(82dvh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-[36px] bg-[var(--vh-surface)] shadow-2xl ring-1 ring-[var(--vh-border)]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#91A0C7]">VerseHub</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-[var(--vh-text-primary)]">Koleksi Kitab</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOverlay(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--vh-surface-elevated)] text-[var(--vh-text-secondary)] transition hover:bg-[var(--vh-surface)] active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex gap-2 border-b border-slate-100 px-6 py-4">
                {(["ot", "nt"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={cn(
                      "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition",
                      tab === item
                        ? "bg-[var(--vh-accent)] text-white"
                        : "bg-[var(--vh-surface-elevated)] text-[var(--vh-text-secondary)] hover:bg-[var(--vh-surface)]"
                    )}
                  >
                    {item === "ot" ? "Perjanjian Lama" : "Perjanjian Baru"}
                  </button>
                ))}
              </div>

              <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.15fr,0.85fr]">
                <div className="min-h-0 overflow-y-auto border-b border-slate-100 p-5 text-[var(--vh-text-primary)] md:border-b-0 md:border-r">
                  <div className="grid grid-cols-2 gap-3">
                    {books.filter((book) => book.testament === tab).map((book) => (
                      <button
                        key={book.code}
                        type="button"
                        onClick={() => void loadBookChapters(book.code)}
                        className={cn(
                          "rounded-[22px] px-4 py-4 text-left text-sm font-bold transition ring-1",
                          activeBook === book.code
                            ? "bg-[var(--vh-accent)] text-white ring-[var(--vh-accent)]"
                            : "bg-[var(--vh-surface-elevated)] text-[var(--vh-text-secondary)] ring-[var(--vh-border)] hover:bg-[var(--vh-surface)]"
                        )}
                      >
                        {book.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 overflow-y-auto p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--vh-text-muted)]">
                    {activeBookLabel ? `Pilih Pasal ${activeBookLabel}` : "Pilih Pasal"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter}
                        type="button"
                        onClick={() => {
                          if (!activeBook) return;
                          setOverlay(null);
                          onNavigate(`/versehub/${lang}/${activeBook}-${chapter}`);
                        }}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--vh-surface-elevated)] text-sm font-bold text-[var(--vh-text-primary)] transition hover:bg-[var(--vh-surface)]"
                      >
                        {chapter}
                      </button>
                    ))}
                    {chapters.length === 0 && (
                      <p className="text-sm text-[var(--vh-text-secondary)]">Pilih kitab terlebih dahulu untuk melihat daftar pasal.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {overlay === "mentor" && mentorPreviewVerse && mentorPreviewLabel && (
        <MentorPanel
          verseRef={mentorPreviewVerse.key}
          lang={lang}
          verseText={mentorPreviewVerse.text}
          verseLabel={mentorPreviewLabel}
          activeMood={mentorMood}
          userReflection={selectedVerseReflection}
          isAuthenticated
          onClose={() => setOverlay(null)}
        />
      )}

      <AmbienceController
        className={cn(
          "z-[70] transition-opacity duration-500",
          shouldShowChrome ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        isDucking={!!overlay}
        activeMoodKey={activeMood}
        dayIndex={new Date().getDay()}
        menuOpen={audioMenuOpen}
        hideTrigger
        onMenuOpen={handleAmbienceMenuOpen}
        onPlaybackStateChange={handlePlaybackStateChange}
      />

      <VersehubControlCenter
        isVisible={shouldShowChrome}
        isOpen={controlCenterOpen}
        items={floatingMenuItems}
        onToggle={onToggleControlCenter}
      />

      {error && isLandingMode && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-40 -translate-x-1/2 px-4">
          <div className="rounded-full bg-[var(--vh-surface)]/85 px-4 py-2 text-[11px] font-bold text-[var(--vh-text-secondary)] shadow-sm ring-1 ring-[var(--vh-border)] backdrop-blur-xl">
            Koneksi kitab sedang tidak stabil, tetapi sanctuary VerseHub tetap siap dipakai.
          </div>
        </div>
      )}

      {isLandingMode && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-24 bg-gradient-to-t from-[var(--vh-bg)]/80 to-transparent" />
      )}

      <AnimatePresence>
        {ogOpen && verseData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md"
          >
            <button
              onClick={() => setOgOpen(false)}
              className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={verseData.og_image_url}
              className="max-h-[85dvh] w-full max-w-5xl rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
