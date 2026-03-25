import type { Metadata } from "next";
import TodayDailyRitualScreen from "@/features/today-ritual/components/TodayDailyRitualScreen";
import { loadTodaySessionContentWithDiagnostics } from "@/features/today-ritual/data/today-session.loader";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Renungan",
  description: "Ritual renungan harian yang tenang untuk menerima, mendoakan, dan menyimpan firman.",
  openGraph: {
    title: "Renungan — The Chosen Talks",
    description: "Ritual renungan harian yang tenang untuk menerima, mendoakan, dan menyimpan firman.",
    images: [
      {
        url: "/og/today-share.png",
        width: 1200,
        height: 630,
        alt: "Renungan harian — The Chosen Talks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Renungan — The Chosen Talks",
    description: "Ritual renungan harian yang tenang untuk menerima, mendoakan, dan menyimpan firman.",
    images: ["/og/today-share.png"],
  },
};

export default async function RenunganPage() {
  const loaded = await loadTodaySessionContentWithDiagnostics();
  return (
    <TodayDailyRitualScreen
      sessionContent={loaded.content}
      showOfflineBanner={loaded.diagnostics.hasOfflineFallback}
    />
  );
}
