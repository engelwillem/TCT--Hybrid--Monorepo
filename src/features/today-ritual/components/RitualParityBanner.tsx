"use client";

type RitualParityBannerProps = {
  parityStatus: "healthy" | "fallback" | "degraded";
};

export function RitualParityBanner({ parityStatus }: RitualParityBannerProps) {
  if (parityStatus === "healthy") return null;

  return (
    <div className="px-6 pt-2">
      <div className="rounded-full border border-sky-200/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(239,246,255,0.72))] px-4 py-2 text-[12px] font-medium text-slate-600 shadow-[0_12px_30px_-24px_rgba(14,165,233,0.35)] backdrop-blur-xl">
        {parityStatus === "fallback"
          ? "Mode cadangan aktif. Konten terbaru mungkin belum tersinkron."
          : "Sebagian konten belum sinkron penuh. Periksa koneksi lalu muat ulang untuk versi terbaru."}
      </div>
    </div>
  );
}
