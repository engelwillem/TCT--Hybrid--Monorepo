"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Flame, Settings, GripHorizontal, Bookmark, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Dummy Data
const STREAK_DAYS = 24;
const FAVORITE_VERSES = [
    { title: "Yosua 1:9", preview: "Kuatkan dan teguhkanlah hatimu...", bg: "bg-gradient-to-br from-blue-900/60 to-black" },
    { title: "Matius 11:28", preview: "Marilah kepada-Ku, semua yang letih...", bg: "bg-gradient-to-br from-amber-900/60 to-black" },
    { title: "Amsal 3:5", preview: "Percayalah kepada TUHAN dengan segenap hatimu...", bg: "bg-gradient-to-br from-emerald-900/60 to-black" },
    { title: "Yesaya 41:10", preview: "Janganlah takut, sebab Aku menyertai engkau...", bg: "bg-gradient-to-br from-indigo-900/60 to-black" },
    { title: "Mazmur 23:1", preview: "TUHAN adalah gembalaku...", bg: "bg-gradient-to-br from-slate-900/60 to-black" },
    { title: "Filipi 4:13", preview: "Segala perkara dapat kutanggung di dalam Dia...", bg: "bg-gradient-to-br from-orange-900/60 to-black" },
];

export default function SanctuaryProfileDraft() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#000000] text-slate-200 font-sans selection:bg-slate-800 selection:text-white pb-32">
            
            {/* Header & Avatar Setup */}
            <div className="relative w-full h-80 overflow-hidden">
                {/* Background Blur */}
                <div className="absolute inset-0 bg-blue-900/20 blur-3xl opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/60 to-[#000000]" />

                {/* Top Navbar */}
                <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
                    <button onClick={() => router.back()} className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 active:scale-90 transition-all text-slate-300">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 active:scale-90 transition-all text-slate-300">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                {/* Profile Identity */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5 z-10">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://i.pravatar.cc/300?img=11" alt="Profile" className="h-full w-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border-2 border-black text-white shadow-lg">
                            Lvl 5
                        </div>
                    </div>
                    
                    <div className="flex-1 pb-2">
                        <h1 className="text-3xl font-serif italic text-white font-bold tracking-tight">Pdt. WillBerth</h1>
                        <p className="text-[11px] font-black tracking-[0.2em] text-blue-400 uppercase mt-1">Seventh-day Adventist Pastor</p>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 mt-6 space-y-8">
                
                {/* Daily Mana Streak (Glassmorphism) */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full relative overflow-hidden rounded-[32px] p-6 border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]"
                >
                    <div className="absolute -right-10 -top-10 h-40 w-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
                                <Flame size={12} className="text-orange-500" /> Daily Mana Streak
                            </p>
                            <h2 className="text-4xl font-black text-white tracking-tighter">{STREAK_DAYS} <span className="text-xl text-slate-500 font-bold tracking-normal">Hari</span></h2>
                        </div>
                        
                        <div className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center bg-black/50 overflow-hidden">
                            <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#F97316" strokeWidth="4" strokeDasharray="282.7" strokeDashoffset="50" className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-2 w-full">
                        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className={cn("h-8 w-full rounded-full flex items-center justify-center text-[10px] font-bold transition-all", idx < 5 ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "bg-white/5 border border-white/10 text-slate-500")}>
                                    {idx < 5 && <CheckCircle className="h-3 w-3" />}
                                </div>
                                <span className="text-[9px] font-black text-slate-500">{day}</span>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Tab Navigation Minimalist */}
                <div className="flex items-center justify-between border-b border-white/5 px-2">
                    <button className="py-4 border-b-2 border-white text-white text-[12px] font-black uppercase tracking-widest px-2 flex-1 text-center flex items-center justify-center gap-2">
                        <GripHorizontal size={14}/> Koleksi
                    </button>
                    <button className="py-4 text-slate-500 hover:text-white transition-colors text-[12px] font-black uppercase tracking-widest px-2 flex-1 text-center flex items-center justify-center gap-2">
                        <Bookmark size={14}/> Sorotan
                    </button>
                    <button className="py-4 text-slate-500 hover:text-white transition-colors text-[12px] font-black uppercase tracking-widest px-2 flex-1 text-center flex items-center justify-center gap-2">
                        <BookOpen size={14}/> Catatan
                    </button>
                </div>

                {/* iPhone Photo Gallery Minimalist Grid for Koleksi */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] w-full pt-4">
                    {FAVORITE_VERSES.map((verse, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ scale: 0.98 }}
                            className={cn(
                                "aspect-square relative flex flex-col items-center justify-center p-4 text-center overflow-hidden cursor-pointer",
                                verse.bg
                            )}
                        >
                            <div className="absolute inset-0 border border-white/5" />
                            <h3 className="text-xl font-serif italic text-white font-bold drop-shadow-md z-10">{verse.title}</h3>
                            <p className="text-[10px] leading-tight text-white/70 font-medium mt-2 max-w-[80%] line-clamp-3 z-10">
                                {verse.preview}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </main>
        </div>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
