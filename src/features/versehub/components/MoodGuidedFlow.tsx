"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Heart, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type MoodFlowKey = "anxious" | "grateful" | "weary";
type FlowStage = "intro" | "verse" | "reflect";

type VersePayload = {
  ref: string;
  reference: string;
  text: string;
};

type MoodFlowConfig = {
  title: string;
  introLine1: string;
  introLine2: string;
  primaryRef: string;
  supportLine: string;
  reflectionQuestion: string;
  relatedRefs: string[];
};

const FALLBACK_VERSES: Record<string, { reference: string; text: string }> = {
  "mat-6-34": {
    reference: "Matius 6:34",
    text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.",
  },
  "flp-4-6": {
    reference: "Filipi 4:6",
    text: "Do not be anxious about anything.",
  },
  "mzm-56-3": {
    reference: "Mazmur 56:3",
    text: "When I am afraid, I put my trust in You.",
  },
  "yes-41-10": {
    reference: "Yesaya 41:10",
    text: "Do not fear, for I am with you.",
  },
  "mzm-103-1": {
    reference: "Mazmur 103:1",
    text: "Praise the LORD, my soul!",
  },
  "1tes-5-18": {
    reference: "1 Tesalonika 5:18",
    text: "Give thanks in all circumstances.",
  },
  "yak-1-17": {
    reference: "Yakobus 1:17",
    text: "Every good and perfect gift is from above.",
  },
  "kol-3-15": {
    reference: "Kolose 3:15",
    text: "Let the peace of Christ rule in your hearts. And be thankful.",
  },
  "yes-40-31": {
    reference: "Yesaya 40:31",
    text: "Those who hope in the LORD will renew their strength.",
  },
  "mat-11-28": {
    reference: "Matius 11:28",
    text: "Come to me, all who are weary and burdened, and I will give you rest.",
  },
  "mzm-46-2": {
    reference: "Mazmur 46:2",
    text: "God is our refuge and strength.",
  },
  "2kor-12-9": {
    reference: "2 Korintus 12:9",
    text: "My grace is sufficient for you, for my power is made perfect in weakness.",
  },
};

const FLOW_CONFIGS: Record<MoodFlowKey, MoodFlowConfig> = {
  anxious: {
    title: "Anxious",
    introLine1: "We see your heart today.",
    introLine2: "Let us come to the Lord.",
    primaryRef: "mat-6-34",
    supportLine: "The Lord calls us to trust, not to worry.",
    reflectionQuestion: "What is making you anxious today?",
    relatedRefs: ["flp-4-6", "mzm-56-3", "yes-41-10"],
  },
  grateful: {
    title: "Grateful",
    introLine1: "Your gratitude is a living prayer.",
    introLine2: "Let us bring this praise to the Lord.",
    primaryRef: "mzm-103-1",
    supportLine: "A grateful heart keeps your steps gentle and strong.",
    reflectionQuestion: "What are you most thankful for today?",
    relatedRefs: ["1tes-5-18", "yak-1-17", "kol-3-15"],
  },
  weary: {
    title: "Need Strength",
    introLine1: "We know you are tired.",
    introLine2: "Receive new strength through God’s word.",
    primaryRef: "yes-40-31",
    supportLine: "When your energy is low, God’s word steadies your steps.",
    reflectionQuestion: "Where do you feel weakest today?",
    relatedRefs: ["mat-11-28", "mzm-46-2", "2kor-12-9"],
  },
};

async function fetchVerseByRef(lang: string, ref: string): Promise<VersePayload> {
  try {
    const response = await fetch(`/api/versehub/${lang}/${ref}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("fetch_failed");
    }

    const payload = (await response.json()) as {
      ref?: string;
      reference?: string;
      text?: string;
    };

    if (!payload?.reference || !payload?.text) {
      throw new Error("invalid_payload");
    }

    return {
      ref: payload.ref || ref,
      reference: payload.reference,
      text: payload.text,
    };
  } catch {
    const fallback = FALLBACK_VERSES[ref] || {
      reference: ref.toUpperCase(),
      text: "Verse is loading.",
    };

    return {
      ref,
      reference: fallback.reference,
      text: fallback.text,
    };
  }
}

function moodIcon(mood: MoodFlowKey) {
  if (mood === "grateful") return <Heart className="h-11 w-11 text-sky-500" />;
  if (mood === "weary") return <Shield className="h-11 w-11 text-sky-500" />;
  return <Sparkles className="h-11 w-11 text-sky-500" />;
}

interface MoodGuidedFlowProps {
  lang: string;
  mood: MoodFlowKey;
  onBack: () => void;
  onOpenVerse: (ref: string) => void;
}

export function MoodGuidedFlow({ lang, mood, onBack, onOpenVerse }: MoodGuidedFlowProps) {
  const [stage, setStage] = useState<FlowStage>("intro");
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const [primaryVerse, setPrimaryVerse] = useState<VersePayload | null>(null);
  const [relatedVerses, setRelatedVerses] = useState<VersePayload[]>([]);
  const config = FLOW_CONFIGS[mood];

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [primary, ...related] = await Promise.all([
        fetchVerseByRef(lang, config.primaryRef),
        ...config.relatedRefs.map((ref) => fetchVerseByRef(lang, ref)),
      ]);

      if (cancelled) return;
      setPrimaryVerse(primary);
      setRelatedVerses(related);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [config.primaryRef, config.relatedRefs, lang]);

  const canSave = reflection.trim().length >= 3;
  const primaryFallback = useMemo(() => FALLBACK_VERSES[config.primaryRef], [config.primaryRef]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#EDF4FF_0%,#E7F1FF_42%,#F2F7FF_100%)] px-5 pb-14 pt-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_10%,rgba(255,255,255,0.85),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_28%),radial-gradient(circle_at_78%_30%,rgba(255,255,255,0.7),transparent_32%),radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.75),transparent_30%)]" />

      <div className="relative mx-auto max-w-[520px]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 ring-1 ring-slate-200/70 backdrop-blur-sm"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {stage === "intro" ? (
          <section className="mx-auto mt-10 max-w-[420px] text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/80 ring-1 ring-sky-100">
              {moodIcon(mood)}
            </div>
            <h2 className="mt-6 text-[44px] font-extrabold tracking-tight text-slate-800">{config.title}</h2>
            <p className="mt-5 text-[34px] leading-[1.15] text-slate-700">{config.introLine1}</p>
            <p className="mt-2 text-[34px] leading-[1.15] text-slate-700">{config.introLine2}</p>

            <button
              type="button"
              onClick={() => setStage("verse")}
              className="mt-12 inline-flex h-14 w-full items-center justify-center rounded-xl bg-[linear-gradient(180deg,#4DA2FF,#2A7EDE)] text-[33px] font-bold text-white shadow-[0_22px_45px_-26px_rgba(37,99,235,0.65)]"
            >
              Continue
            </button>
          </section>
        ) : null}

        {stage === "verse" ? (
          <section className="mx-auto mt-8 max-w-[440px] rounded-[26px] bg-white/70 px-6 py-8 text-center shadow-[0_26px_60px_-38px_rgba(15,23,42,0.35)] ring-1 ring-white/80 backdrop-blur-sm">
            <h3 className="text-[26px] font-bold text-slate-800">{primaryVerse?.reference || primaryFallback.reference}</h3>
            <p className="mt-5 text-[38px] leading-[1.28] text-slate-800">"{primaryVerse?.text || primaryFallback.text}"</p>
            <p className="mt-7 text-[31px] leading-[1.2] text-slate-600">{config.supportLine}</p>

            <button
              type="button"
              onClick={() => setStage("reflect")}
              className="mt-10 inline-flex h-14 w-full items-center justify-center rounded-xl bg-[linear-gradient(180deg,#4DA2FF,#2A7EDE)] text-[33px] font-bold text-white shadow-[0_22px_45px_-26px_rgba(37,99,235,0.65)]"
            >
              Reflect
            </button>

            <button
              type="button"
              onClick={() => onOpenVerse(config.primaryRef)}
              className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-sky-700"
            >
              Buka di VerseHub <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        ) : null}

        {stage === "reflect" ? (
          <section className="mx-auto mt-6 max-w-[460px] space-y-4">
            <div className="rounded-[18px] bg-white/88 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/65">
              <p className="text-[33px] font-semibold leading-[1.15] text-slate-800">{config.reflectionQuestion}</p>
              <textarea
                value={reflection}
                onChange={(event) => {
                  setReflection(event.target.value);
                  if (saved) setSaved(false);
                }}
                placeholder="Write your reflection..."
                className="mt-3 min-h-[92px] w-full resize-none rounded-xl border border-slate-200 bg-[#F8FBFF] px-3 py-2 text-[24px] leading-[1.35] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                disabled={!canSave}
                onClick={() => setSaved(true)}
                className={cn(
                  "mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl text-[30px] font-bold text-white",
                  canSave ? "bg-[linear-gradient(180deg,#4DA2FF,#2A7EDE)]" : "bg-slate-300"
                )}
              >
                {saved ? "Saved" : "Save Reflection"}
              </button>
            </div>

            <div className="rounded-[18px] bg-white/88 p-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/65">
              <h4 className="text-[30px] font-bold text-slate-800">More verses for you</h4>
              <ul className="mt-3 space-y-2">
                {relatedVerses.map((verse) => (
                  <li key={verse.ref} className="border-t border-slate-200/80 pt-2 first:border-t-0 first:pt-0">
                    <button
                      type="button"
                      onClick={() => onOpenVerse(verse.ref)}
                      className="w-full text-left"
                    >
                      <p className="text-[27px] font-semibold text-slate-800">{verse.reference}</p>
                      <p className="mt-1 line-clamp-2 text-[22px] leading-[1.25] text-slate-600">{verse.text}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
