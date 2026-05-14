import { Head, router } from '@inertiajs/react';

function goBackToPreviousPage() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
        return;
    }

    router.visit('/');
}

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 text-white">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] bg-[length:22px_22px]"
                />
                <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-44 right-[-180px] h-[560px] w-[560px] rounded-full bg-blue-500/10 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-40 left-[-180px] h-[520px] w-[520px] rounded-full bg-teal-400/10 blur-3xl" />

                <main className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
                    <h1 className="tct-serif text-3xl text-white sm:text-4xl">Privacy Policy</h1>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
                        <p className="text-sm leading-relaxed text-white/75">
                            Kami menjaga data Anda untuk kebutuhan operasional aplikasi, keamanan akun, dan peningkatan pengalaman pengguna.
                            Kami tidak menjual data pribadi pengguna kepada pihak ketiga.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-white/75">
                            Data yang dapat diproses termasuk informasi akun, aktivitas bacaan, dan interaksi komunitas sesuai izin pengguna.
                            Anda dapat menghubungi admin untuk permintaan koreksi atau penghapusan data sesuai kebijakan yang berlaku.
                        </p>
                    </div>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={goBackToPreviousPage}
                            className="text-sm font-semibold text-cyan-300 underline-offset-4 transition hover:text-cyan-200 hover:underline"
                        >
                            Kembali ke Landing
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
}
