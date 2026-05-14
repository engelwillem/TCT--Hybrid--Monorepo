import type { Metadata } from "next";
import TodayDailyRitualScreen from "@/features/today-ritual/components/TodayDailyRitualScreen";
import { loadTodaySessionContentWithDiagnostics } from "@/features/today-ritual/data/today-session.loader";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Daily Reflection",
  description: "Start your day with living Scripture. Receive a verse, reflect on its meaning, and pray today with The Chosen Talks community.",
  openGraph: {
    title: "Daily Reflection — The Chosen Talks",
    description: "Start your day with living Scripture. Receive a verse, reflect on its meaning, and pray today.",
    images: [
      {
        url: "/api/og/today",
        width: 1200,
        height: 630,
        alt: "Daily Reflection — The Chosen Talks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Reflection — The Chosen Talks",
    description: "Start your day with living Scripture. Receive a verse, reflect on its meaning, and pray today.",
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
