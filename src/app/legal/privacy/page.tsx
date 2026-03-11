"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 text-white flex flex-col items-center justify-center">
            {/* Grid Pattern Background Parity */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] bg-[length:22px_22px]"
            />
            {/* Ambient Blur Overlays Parity */}
            <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-44 right-[-180px] h-[560px] w-[560px] rounded-full bg-blue-500/10 blur-3xl home-blur" />
            
            <main className="relative z-10 mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
                <h1 className="tct-serif text-4xl text-white sm:text-5xl font-bold tracking-tight">Privacy Policy</h1>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-3xl shadow-2xl ring-1 ring-white/10">
                    <div className="space-y-6 text-sm sm:text-[15px] leading-relaxed text-white/80 font-medium">
                        <p>
                            Kami menjaga data Anda untuk kebutuhan operasional aplikasi, keamanan akun, dan peningkatan pengalaman pengguna. 
                            Kami tidak menjual data pribadi pengguna kepada pihak ketiga.
                        </p>
                        <p>
                            Data yang dapat diproses termasuk informasi akun, aktivitas bacaan (VerseHub), dan interaksi komunitas sesuai izin pengguna.
                            Keamanan data Anda adalah prioritas utama kami dalam membangun platform rohani yang aman.
                        </p>
                        <p>
                            Anda dapat menghubungi admin melalui inbox atau email support untuk permintaan koreksi atau penghapusan data pribadi sesuai dengan kebijakan privasi yang berlaku.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="group flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-white transition-all active:scale-95"
                    >
                        <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Beranda
                    </button>
                </div>
            </main>
        </div>
    );
}
