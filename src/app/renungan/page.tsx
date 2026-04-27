import type { Metadata } from "next";
import TodayDailyRitualScreen from "@/features/today-ritual/components/TodayDailyRitualScreen";
import { loadRenunganSessionContentWithDiagnostics } from "@/features/today-ritual/data/today-session.loader";
import { resolveRenunganEntryIntent } from "@/features/today-ritual/utils/entry-intent";

export const revalidate = 300;

function getJakartaDateKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function clampText(value: string, limit: number): string {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  if (limit <= 3) return normalized.slice(0, limit);
  return `${normalized.slice(0, limit - 3).trimEnd()}...`;
}

export async function generateMetadata(): Promise<Metadata> {
  const loaded = await loadRenunganSessionContentWithDiagnostics();
  const verseReference = clampText(loaded.content.verseReference, 72) || "Renungan Harian";
  const verseText = clampText(loaded.content.verseText, 220);
  const description = verseText || "Terimalah firman yang menuntun langkahmu hari ini.";
  const dateKey = getJakartaDateKey();
  const imageUrl = `/api/og/today?d=${encodeURIComponent(dateKey)}`;

  return {
    title: `${verseReference} — Renungan Harian`,
    description,
    openGraph: {
      title: `${verseReference} — Renungan Harian`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: verseReference,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${verseReference} — Renungan Harian`,
      description,
      images: [imageUrl],
    },
  };
}

type RenunganPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RenunganPage({ searchParams }: RenunganPageProps) {
  const params = await searchParams;
  const entryIntent = resolveRenunganEntryIntent(params);
  const loaded = await loadRenunganSessionContentWithDiagnostics();
  const parityStatus: "healthy" | "fallback" | "degraded" = loaded.diagnostics.experienceState;

  return (
    <TodayDailyRitualScreen
      sessionContent={loaded.content}
      parityStatus={parityStatus}
      entryIntent={entryIntent}
    />
  );
}
