import type { Metadata } from "next";
import TodayDailyRitualScreen from "@/features/today-ritual/components/TodayDailyRitualScreen";
import { loadTodaySessionContentWithDiagnostics } from "@/features/today-ritual/data/today-session.loader";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Renungan Harian",
  description: "Mulai harimu dengan firman yang hidup. Terima ayat, renungkan maknanya, dan doakan hari ini bersama komunitas The Chosen Talks.",
  openGraph: {
    title: "Renungan Harian — The Chosen Talks",
    description: "Mulai harimu dengan firman yang hidup. Terima ayat, renungkan maknanya, dan doakan hari ini.",
    images: [
      {
        url: "/api/og/today",
        width: 1200,
        height: 630,
        alt: "Renungan harian — The Chosen Talks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Renungan Harian — The Chosen Talks",
    description: "Mulai harimu dengan firman yang hidup. Terima ayat, renungkan maknanya, dan doakan hari ini.",
    images: ["/api/og/today"],
  },
};

export default async function RenunganPage() {
  const loaded = await loadTodaySessionContentWithDiagnostics();
  const parityStatus: "healthy" | "fallback" | "degraded" =
    loaded.diagnostics.sourceStatus === "fallback_only"
      ? "fallback"
      : loaded.diagnostics.warnCount > 0
        ? "degraded"
        : "healthy";

  return (
    <TodayDailyRitualScreen
      sessionContent={loaded.content}
      parityStatus={parityStatus}
    />
  );
}
