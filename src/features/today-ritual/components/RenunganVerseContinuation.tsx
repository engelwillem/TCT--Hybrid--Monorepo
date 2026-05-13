"use client";

import type { RefObject } from "react";
import { SurfaceBridgeAction } from "@/components/core/SurfaceBridgeAction";
import type { EmotionalEntryState } from "@/features/ux-architecture/types";
import type { RenunganMatch } from "../content/personal-renungan";

type RenunganVerseContinuationProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  personalRenungan: RenunganMatch;
  entryState: EmotionalEntryState | null;
  onReadFullChapter: () => void;
  onOpenRelatedVerse: (verseReference: string) => void;
};

export function RenunganVerseContinuation({
  containerRef,
  personalRenungan,
  entryState,
  onReadFullChapter,
  onOpenRelatedVerse,
}: RenunganVerseContinuationProps) {
  return (
    <div
      ref={containerRef}
      id="pendalaman-firman"
      tabIndex={-1}
      className="mt-6 rounded-2xl border border-sky-100/90 bg-white/80 p-4 sm:p-5 focus:outline-none"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-700">Scripture Deep Dive</p>
      <h3 className="mt-2 tct-serif text-[21px] leading-[1.4] text-foreground/90">
        Stay with this verse a little longer, slowly.
      </h3>

      <div className="mt-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">Simple meaning</p>
        <p className="mt-2 text-[14px] leading-7 text-foreground/78">{personalRenungan.meditation}</p>
      </div>

      {entryState ? (
        <div className="mt-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
            Why this verse connects with your state
          </p>
          <p className="mt-2 text-[14px] leading-7 text-foreground/78">
            This reflection is tuned to the <span className="font-semibold text-foreground/85">{entryState}</span> state you selected.
            If you want, continue by reading the broader verse context.
          </p>
        </div>
      ) : null}

      {personalRenungan.relatedVerses?.length ? (
        <div className="mt-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">Related verses</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {personalRenungan.relatedVerses.slice(0, 3).map((item) => (
              <button
                key={item.reference}
                type="button"
                onClick={() => onOpenRelatedVerse(item.reference)}
                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[12px] font-semibold text-sky-700 transition-colors hover:bg-sky-100"
              >
                {item.reference}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onReadFullChapter}
          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          Read full context in VerseHub
        </button>
        <SurfaceBridgeAction target="versehub" label="Save this reflection" href="/versehub/id/my-spiritual-journey" />
      </div>
    </div>
  );
}
