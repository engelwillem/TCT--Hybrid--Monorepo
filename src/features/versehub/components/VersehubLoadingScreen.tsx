"use client";

interface VersehubLoadingScreenProps {
    label?: string;
}

export function VersehubLoadingScreen({
    label = "Menyiapkan ruang baca VerseHub...",
}: VersehubLoadingScreenProps) {
    return (
        <div className="relative flex min-h-[100dvh] overflow-hidden bg-transparent text-foreground">
            <div className="relative z-10 mx-auto flex w-full max-w-[620px] flex-1 flex-col px-6 py-8">
                <div className="h-11 w-11 rounded-full bg-white shadow-[0_18px_36px_-26px_rgba(15,23,42,0.18)] ring-1 ring-sky-200/70" />
                <div className="mt-8 rounded-[34px] border border-white/70 bg-white/92 px-6 py-7 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.26)] backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-[#e7f4ff]" />
                        <div className="flex-1">
                            <div className="h-3 w-28 rounded-full bg-sky-100" />
                            <div className="mt-2 h-3 w-52 rounded-full bg-slate-100" />
                        </div>
                    </div>
                    <div className="mt-6 h-10 w-[76%] rounded-[16px] bg-slate-100" />
                    <div className="mt-3 h-10 w-[58%] rounded-[16px] bg-slate-50" />
                    <div className="mt-6 h-4 w-full rounded-full bg-slate-100" />
                    <div className="mt-3 h-4 w-[84%] rounded-full bg-slate-100" />
                    <div className="mt-8 flex gap-3">
                        <div className="h-12 w-40 rounded-full bg-slate-900" />
                        <div className="h-12 w-36 rounded-full bg-slate-100" />
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500" />
                        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/45">
                            {label}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
