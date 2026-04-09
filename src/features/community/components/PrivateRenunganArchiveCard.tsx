"use client";

import { Bookmark, BookOpenText } from "lucide-react";

type RelatedVerse = {
  reference?: string;
  text?: string;
};

type PrivateRenunganArchiveCardProps = {
  reflection?: string;
  meditation?: string;
  verseText?: string;
  verseReference?: string;
  relatedVerses?: RelatedVerse[];
  interpretationSummary?: string;
  createdAtLabel?: string;
};

function Section({ label, content }: { label: string; content?: string }) {
  if (!content?.trim()) return null;
  return (
    <section className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0369a1]">{label}</p>
      <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-800">{content.trim()}</p>
    </section>
  );
}

export function PrivateRenunganArchiveCard({
  reflection,
  meditation,
  verseText,
  verseReference,
  relatedVerses = [],
  interpretationSummary,
  createdAtLabel,
}: PrivateRenunganArchiveCardProps) {
  return (
    <div className="rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(247,250,255,0.92))] px-5 py-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0f2fe] text-[#0284c7]">
          <BookOpenText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0284c7]">Renungan Pribadi</p>
          {createdAtLabel ? (
            <p className="mt-1 text-[12px] font-medium text-slate-500">{createdAtLabel}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        <Section label="Isi Hati" content={reflection} />
        <Section label="Renungan" content={meditation} />
        <Section label="Ayat" content={verseText} />
        {verseReference?.trim() ? (
          <p className="text-[12px] font-semibold tracking-[0.12em] text-slate-500">{verseReference.trim()}</p>
        ) : null}

        {relatedVerses.length > 0 ? (
          <section className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0369a1]">Ayat Pendukung</p>
            <div className="space-y-3">
              {relatedVerses.slice(0, 3).map((item, index) => (
                <div key={`${item.reference || "verse"}-${index}`} className="rounded-2xl bg-slate-50/90 px-3 py-2">
                  {item.text ? <p className="text-[14px] leading-6 text-slate-700">{item.text}</p> : null}
                  {item.reference ? <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.reference}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {interpretationSummary?.trim() ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1.5 text-[11px] font-semibold text-sky-700">
            <Bookmark className="h-3.5 w-3.5" />
            {interpretationSummary.trim()}
          </div>
        ) : null}
      </div>
    </div>
  );
}

