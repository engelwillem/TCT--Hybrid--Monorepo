import AuthShell from '@/Layouts/AuthShell';
import { Button } from '@/Components/ui/button';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import type { PageProps } from '@/types';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const page = usePage<
        PageProps<{
            verification_url?: string;
            verification_link_expires_at?: string;
            email?: string;
        }>
    >();
    const verificationUrl = page.props.verification_url;
    const verificationEmail = page.props.email;
    const fallbackExpiry = page.props.verification_link_expires_at;
    const fallbackExpiryLabel = fallbackExpiry
        ? new Date(fallbackExpiry).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
        : null;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send', {}, false));
    };

    return (
        <AuthShell title="Verify email" topHref="/">
            <div className="mx-auto w-full max-w-sm space-y-4 sm:max-w-md sm:space-y-6">
                <div className="text-center">
                    <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]">
                        ✉
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Verify your email
                        </span>
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                        Cek inbox lalu klik link verifikasi untuk melanjutkan.
                    </p>
                    {verificationEmail ? (
                        <p className="mt-1 break-all text-xs text-white/45">{verificationEmail}</p>
                    ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm leading-relaxed text-white/75 backdrop-blur-sm sm:p-4">
                    <div className="mx-auto max-w-[31ch] text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100/80">Butuh bantuan cepat?</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                            Jika email belum masuk,
                            <br className="sm:hidden" />
                            kirim ulang dari tombol di bawah.
                        </p>
                    </div>
                </div>

                {status === 'verification-link-sent' ? (
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm leading-relaxed text-emerald-200 backdrop-blur-sm">
                        Link verifikasi baru sudah dikirim.
                    </div>
                ) : null}

                {status === 'verification-link-failed' ? (
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-100 backdrop-blur-sm">
                        Kami belum bisa mengirim email verifikasi. Coba lagi sebentar lagi.
                    </div>
                ) : null}

                {status === 'verification-link-dev-fallback' ? (
                    <div className="space-y-2 rounded-2xl border border-sky-300/20 bg-sky-500/10 p-3 text-sm leading-relaxed text-sky-100 backdrop-blur-sm">
                        <p className="font-medium">SMTP belum terhubung. Link verifikasi lokal disiapkan sementara.</p>
                        {fallbackExpiryLabel ? (
                            <p className="text-xs text-sky-100/90">Berlaku sampai: {fallbackExpiryLabel}</p>
                        ) : null}
                        {verificationUrl ? (
                            <a
                                href={verificationUrl}
                                className="inline-flex w-full items-center justify-center rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-white sm:w-auto"
                            >
                                Verify now (local)
                            </a>
                        ) : null}
                    </div>
                ) : null}

                <form onSubmit={submit} className="space-y-3">
                    <Button
                        type="submit"
                        disabled={processing}
                        className={
                            'h-12 w-full rounded-full px-6 ' +
                            'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 ' +
                            'shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_16px_48px_rgba(34,211,238,0.25)] ' +
                            'transition-all hover:shadow-[0_0_0_1px_rgba(34,211,238,0.30),0_22px_60px_rgba(34,211,238,0.30)] active:scale-[0.98]'
                        }
                    >
                        <span className="font-semibold">{processing ? 'Sending...' : 'Resend email'}</span>
                    </Button>

                    <div className="text-center">
                        <Link
                            href={route('logout', {}, false)}
                            method="post"
                            as="button"
                            className="text-sm text-white/65 underline-offset-4 hover:text-white hover:underline"
                        >
                            Log out
                        </Link>
                    </div>
                </form>
            </div>
        </AuthShell>
    );
}
