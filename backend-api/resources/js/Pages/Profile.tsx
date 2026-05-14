import InputError from '@/Components/InputError';
import AccordionCard from '@/Components/core/AccordionCard';
import DarkCard from '@/Components/core/DarkCard';
import PrimaryCTA from '@/Components/core/PrimaryCTA';
import { IconGrid } from '@/Components/icons/AppIcons';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { PageProps } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

export default function Profile({
    mustVerifyEmail,
    status,
    opsGateway,
    twoFactor,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    opsGateway?: {
        status: 'Healthy' | 'Needs Attention' | 'High Risk' | string;
        riskScore: number;
        topAction: string;
        statusHref?: string;
    };
    twoFactor?: {
        enabled: boolean;
        recoveryCodesRemaining: number;
    };
}>) {
    const user = usePage().props.auth.user;

    // This page is behind auth middleware, but types allow null.
    // Guard just to satisfy TS and keep runtime safe.
    if (!user) {
        return (
            <MobileAppLayout title="Profile" activeNavId="settings" backHref="/today">
                <DarkCard>
                    <p className="text-sm text-white/70">Please log in.</p>
                </DarkCard>
            </MobileAppLayout>
        );
    }

    const logoutForm = useForm({});
    const logout = () => logoutForm.post(route('logout', {}, false));

    // Multi-device logout detection is handled globally in the main layout
    // via `useAuthPing()` so it doesn't create duplicate intervals per-page.

    // Avatar upload (separate form, triggered directly from the avatar)
    const avatarForm = useForm({
        avatar: null as File | null,
        _method: 'patch' as const,
    });

    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
    const [avatarQueued, setAvatarQueued] = useState(false);
    const [journeyBadge, setJourneyBadge] = useState(0);
    const [twoFactorPassword, setTwoFactorPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
    const [twoFactorBusy, setTwoFactorBusy] = useState(false);
    const [twoFactorSetupData, setTwoFactorSetupData] = useState<{
        secret: string;
        qrCodeDataUri: string;
        recoveryCodes: string[];
    } | null>(null);
    const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const firstName = (user.name ?? 'User').split(' ')[0];

    // NOTE:
    // `opsGateway.statusHref` can point to Filament (/admintalk/...) which is NOT an Inertia page.
    // If we use Inertia <Link> to hit a non-Inertia endpoint, Inertia will show an overlay/error.
    // For those URLs we must do a full-page navigation via a plain <a href>.
    // For admins, backend may provide a Filament (/admintalk/...) deep link.
    // For non-admins, keep a safe in-app fallback.
    const opsStatusHref = opsGateway?.statusHref || (user.is_admin ? '/admintalk/ops-triage' : '/settings/ops-visibility#today-attention');
    const opsStatusHrefIsNonInertia = String(opsStatusHref).includes('/admintalk');

    const pickAvatar = () => avatarInputRef.current?.click();

    useEffect(() => {
        if (!avatarForm.data.avatar) {
            setAvatarPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(avatarForm.data.avatar);
        setAvatarPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [avatarForm.data.avatar]);

    useEffect(() => {
        let active = true;
        const run = async () => {
            try {
                const res = await fetch('/versehub/id/reader-actions/summary?limit=1&sort=recent', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!res.ok) return;
                const json = await res.json();
                const counts = json?.counts && typeof json.counts === 'object' ? json.counts : {};
                const total =
                    Number(counts?.favorites || 0) +
                    Number(counts?.bookmarks || 0) +
                    Number(counts?.notes || 0);
                if (active) setJourneyBadge(total);
            } catch {
                if (active) setJourneyBadge(0);
            }
        };
        run();
        return () => {
            active = false;
        };
    }, []);

    // IMPORTANT:
    // In React, state updates are async. If we call `avatarForm.setData('avatar', file)` and immediately
    // call `avatarForm.post(...)` in the same event, the request may be sent without the file.
    // This effect uploads only after the file is actually in `avatarForm.data.avatar`.
    useEffect(() => {
        if (!avatarQueued) return;
        if (!avatarForm.data.avatar) return;
        if (avatarForm.processing) return;

        avatarForm.post(route('profile.update', {}, false), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                // Reload only the auth data to get updated avatar URL
                router.reload({ only: ['auth'] });
            },
            onFinish: () => {
                setAvatarQueued(false);
                avatarForm.setData('avatar', null);
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatarQueued, avatarForm.data.avatar]);

    // Update profile info (name/email)
    const profileForm = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
    });

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update', {}, false), {
            preserveScroll: true,
        });
    };

    // Update password
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const newPasswordInput = useRef<HTMLInputElement>(null);

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update', {}, false), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: (errors) => {
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                    currentPasswordInput.current?.focus();
                }
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    newPasswordInput.current?.focus();
                }
            },
        });
    };

    // Delete account
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const deletePasswordInput = useRef<HTMLInputElement>(null);
    const deleteForm = useForm({ password: '' });

    const submitDelete: FormEventHandler = (e) => {
        e.preventDefault();
        deleteForm.delete(route('profile.destroy', {}, false), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDelete(false),
            onError: () => deletePasswordInput.current?.focus(),
            onFinish: () => deleteForm.reset(),
        });
    };

    const getCsrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';

    const handleTwoFactorSetup = async () => {
        setTwoFactorBusy(true);
        setTwoFactorError(null);
        setNewRecoveryCodes(null);
        try {
            const response = await fetch(route('profile.two-factor.setup', {}, false), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    current_password: twoFactorPassword,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                setTwoFactorError(
                    payload?.errors?.current_password?.[0] ??
                        payload?.message ??
                        'Gagal memulai setup 2FA.',
                );
                return;
            }

            const payload = await response.json();
            setTwoFactorSetupData(payload);
        } catch {
            setTwoFactorError('Terjadi gangguan saat setup 2FA.');
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const handleRegenerateRecoveryCodes = async () => {
        setTwoFactorBusy(true);
        setTwoFactorError(null);
        try {
            const response = await fetch(route('profile.two-factor.recovery-codes', {}, false), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    current_password: twoFactorPassword,
                    code: twoFactorCode,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                setTwoFactorError(payload?.message ?? 'Gagal membuat recovery code baru.');
                return;
            }

            const payload = await response.json();
            setNewRecoveryCodes(payload?.recoveryCodes ?? []);
            setTwoFactorCode('');
            router.reload({ only: ['twoFactor', 'status'] });
        } catch {
            setTwoFactorError('Terjadi gangguan saat membuat recovery code.');
        } finally {
            setTwoFactorBusy(false);
        }
    };

    return (
        <MobileAppLayout
            title="Profile"
            activeNavId="settings"
            backHref="/today"
            rightAction={
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-soft"
                            aria-label="Profile menu"
                        >
                            <IconGrid className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="p-2">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white/90 hover:bg-white/5"
                            onClick={logout}
                            disabled={logoutForm.processing}
                        >
                            <span>Log out</span>
                            <span className="text-xs text-white/50">All devices</span>
                        </button>
                    </PopoverContent>
                </Popover>
            }
        >
            <DarkCard>
                <div className="flex flex-col items-center text-center">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={pickAvatar}
                            className="group relative"
                            aria-label="Change profile photo"
                        >
                            {avatarPreviewUrl || user.avatarUrl ? (
                                <img
                                    src={avatarPreviewUrl ?? user.avatarUrl ?? undefined}
                                    alt={user.name}
                                    className="h-20 w-20 rounded-full object-cover ring-1 ring-white/10"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-xl font-semibold">
                                    {(user.name ?? 'U').slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand/0 transition group-hover:ring-brand/40" />
                            {avatarForm.processing ? (
                                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 text-xs font-medium text-white">
                                    Uploading…
                                </span>
                            ) : null}
                        </button>

                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                            className="hidden"
                            onChange={(e) => {
                                const file =
                                    e.target.files && e.target.files.length
                                        ? e.target.files[0]
                                        : null;

                                // Reset input value so the same file can be selected again later.
                                e.currentTarget.value = '';

                                if (!file) return;

                                avatarForm.setData('avatar', file);
                                setAvatarQueued(true);
                            }}
                        />
                    </div>

                    <InputError
                        message={avatarForm.errors.avatar}
                        className="mt-3 text-red-300"
                    />

                    <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
                    <p className="text-sm text-white/70">{user.email}</p>
                    {user.email_verified_at ? (
                        <p className="mt-2 text-xs text-emerald-300">Verified</p>
                    ) : (
                        <p className="mt-2 text-xs text-amber-200">Not verified</p>
                    )}
                </div>
            </DarkCard>

            <div className="mt-6 space-y-4">
                {user.is_admin ? (
                    <AccordionCard title="Gateway Operasional">
                        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-semibold text-white/90">Welcome back, {firstName}.</p>
                                {opsStatusHrefIsNonInertia ? (
                                    <a
                                        href={opsStatusHref}
                                        className={`inline-flex w-fit max-w-full items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:brightness-110 ${
                                            opsGateway?.status === 'High Risk'
                                                ? 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/30'
                                                : opsGateway?.status === 'Needs Attention'
                                                  ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-300/25'
                                                  : 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/25'
                                        }`}
                                        title={
                                            opsGateway?.status === 'High Risk'
                                                ? 'Buka halaman penanganan prioritas'
                                                : 'Buka Ops Visibility'
                                        }
                                    >
                                        Status Today: {opsGateway?.status ?? 'Healthy'}
                                    </a>
                                ) : (
                                    <Link
                                        href={opsStatusHref}
                                        className={`inline-flex w-fit max-w-full items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:brightness-110 ${
                                            opsGateway?.status === 'High Risk'
                                                ? 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-300/30'
                                                : opsGateway?.status === 'Needs Attention'
                                                  ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-300/25'
                                                  : 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/25'
                                        }`}
                                        title={
                                            opsGateway?.status === 'High Risk'
                                                ? 'Buka halaman penanganan prioritas'
                                                : 'Buka Ops Visibility'
                                        }
                                    >
                                        Status Today: {opsGateway?.status ?? 'Healthy'}
                                    </Link>
                                )}
                            </div>
                            <p className="text-sm text-white/70">Aksi prioritas: {opsGateway?.topAction ?? 'Lanjutkan monitoring harian.'}</p>
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                                <Link
                                    href="/settings/ops-visibility"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white/90 sm:w-auto"
                                >
                                    Open Ops Control Center
                                </Link>
                                <Link
                                    href="/settings/kpi-dashboard"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400/90 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
                                >
                                    Open KPI Dashboard
                                </Link>
                                <a
                                    href="/admintalk"
                                    className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-transparent px-4 py-2 text-xs font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline sm:w-auto sm:border-0 sm:px-0 sm:py-0"
                                >
                                    Open Admin Backoffice
                                </a>
                            </div>
                        </div>
                    </AccordionCard>
                ) : null}

                <AccordionCard title="Your Spiritual Journey">
                    <Link
                        href="/versehub/id/my-spiritual-journey"
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 transition hover:bg-white/10"
                    >
                        <span className="font-medium">Track your saved verses, notes, and favorites</span>
                        <span className="inline-flex items-center gap-2">
                            {journeyBadge > 0 ? (
                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                    {journeyBadge}
                                </span>
                            ) : null}
                            <span className="text-xs font-semibold text-white/70">Open →</span>
                        </span>
                    </Link>
                </AccordionCard>

                <AccordionCard
                    title="Profile"
                >
                    <form onSubmit={submitProfile} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-white/80">
                                Name
                            </label>
                            <Input
                                value={profileForm.data.name}
                                onChange={(e) =>
                                    profileForm.setData('name', e.target.value)
                                }
                                className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-brand/40"
                                autoComplete="name"
                                required
                            />
                            <InputError
                                message={profileForm.errors.name}
                                className="mt-2 text-red-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-white/80">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) =>
                                    profileForm.setData('email', e.target.value)
                                }
                                className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-brand/40"
                                autoComplete="username"
                                required
                            />
                            <InputError
                                message={profileForm.errors.email}
                                className="mt-2 text-red-300"
                            />
                        </div>

                        {mustVerifyEmail && !user.email_verified_at ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm text-white/70">
                                    Your email address is unverified.
                                </p>
                                <Link
                                    href={route('verification.send', {}, false)}
                                    method="post"
                                    as="button"
                                    className="mt-2 text-sm text-white/65 underline-offset-4 hover:text-white hover:underline"
                                >
                                    Re-send verification email
                                </Link>

                                {status === 'verification-link-sent' ? (
                                    <p className="mt-2 text-sm text-emerald-300">
                                        A new verification link has been sent.
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        <PrimaryCTA
                            label={profileForm.processing ? 'Saving...' : 'Save'}
                            size="md"
                            disabled={profileForm.processing}
                        />
                    </form>
                </AccordionCard>

                <AccordionCard title="Password">
                    <p className="text-sm text-white/70">
                        Use a strong password to keep your account secure.
                    </p>

                    <form onSubmit={submitPassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-white/80">
                                Current password
                            </label>
                            <Input
                                ref={currentPasswordInput}
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        'current_password',
                                        e.target.value,
                                    )
                                }
                                className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-brand/40"
                                autoComplete="current-password"
                            />
                            <InputError
                                message={passwordForm.errors.current_password}
                                className="mt-2 text-red-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-white/80">
                                New password
                            </label>
                            <Input
                                ref={newPasswordInput}
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) =>
                                    passwordForm.setData('password', e.target.value)
                                }
                                className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-brand/40"
                                autoComplete="new-password"
                            />
                            <InputError
                                message={passwordForm.errors.password}
                                className="mt-2 text-red-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-white/80">
                                Confirm password
                            </label>
                            <Input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                className="mt-2 h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-brand/40"
                                autoComplete="new-password"
                            />
                            <InputError
                                message={passwordForm.errors.password_confirmation}
                                className="mt-2 text-red-300"
                            />
                        </div>

                        <PrimaryCTA
                            label={passwordForm.processing ? 'Updating...' : 'Update password'}
                            size="md"
                            disabled={passwordForm.processing}
                        />
                    </form>
                </AccordionCard>

                <AccordionCard title="Two-factor authentication (2FA)">
                    <p className="text-sm text-white/70">
                        Lindungi akun dengan OTP dari Google Authenticator / Authy.
                    </p>

                    {status === 'two-factor-enabled' ? (
                        <p className="mt-3 text-sm text-emerald-300">2FA berhasil diaktifkan.</p>
                    ) : null}
                    {status === 'two-factor-disabled' ? (
                        <p className="mt-3 text-sm text-amber-200">2FA dinonaktifkan.</p>
                    ) : null}
                    {status === 'two-factor-setup-expired' ? (
                        <p className="mt-3 text-sm text-amber-200">
                            Setup 2FA kedaluwarsa. Silakan mulai ulang.
                        </p>
                    ) : null}

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/80">
                            Status:{' '}
                            <span className={twoFactor?.enabled ? 'text-emerald-300' : 'text-amber-200'}>
                                {twoFactor?.enabled ? 'Aktif' : 'Belum aktif'}
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-white/55">
                            Recovery code tersisa: {twoFactor?.recoveryCodesRemaining ?? 0}
                        </p>
                    </div>

                    <div className="mt-4 space-y-3">
                        <label className="text-sm font-medium text-white/80">
                            Konfirmasi password
                        </label>
                        <Input
                            type="password"
                            value={twoFactorPassword}
                            onChange={(e) => setTwoFactorPassword(e.target.value)}
                            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                            placeholder="Password saat ini"
                            autoComplete="current-password"
                        />

                        {twoFactor?.enabled ? (
                            <>
                                <Input
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                                    placeholder="Kode OTP / recovery code"
                                />

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <Button
                                        type="button"
                                        onClick={handleRegenerateRecoveryCodes}
                                        disabled={twoFactorBusy}
                                        className="h-11 rounded-full bg-white text-slate-900 hover:bg-white/90"
                                    >
                                        {twoFactorBusy ? 'Processing...' : 'Regenerate Recovery Codes'}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={twoFactorBusy}
                                        className="h-11 rounded-full border-red-300/30 bg-transparent text-red-100 hover:bg-red-500/10"
                                        onClick={() => {
                                            router.delete(route('profile.two-factor.disable', {}, false), {
                                                preserveScroll: true,
                                                data: {
                                                    current_password: twoFactorPassword,
                                                    code: twoFactorCode,
                                                },
                                                onError: (errors) => {
                                                    setTwoFactorError(
                                                        errors.two_factor_code ??
                                                            errors.code ??
                                                            errors.current_password ??
                                                            'Gagal menonaktifkan 2FA.',
                                                    );
                                                },
                                                onSuccess: () => {
                                                    setTwoFactorError(null);
                                                    setTwoFactorCode('');
                                                    setTwoFactorSetupData(null);
                                                    setNewRecoveryCodes(null);
                                                },
                                            });
                                        }}
                                    >
                                        Nonaktifkan 2FA
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleTwoFactorSetup}
                                disabled={twoFactorBusy}
                                className="h-11 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950"
                            >
                                {twoFactorBusy ? 'Memproses...' : 'Mulai Setup 2FA'}
                            </Button>
                        )}
                    </div>

                    {twoFactorSetupData ? (
                        <div className="mt-4 space-y-3 rounded-2xl border border-cyan-300/25 bg-cyan-500/10 p-4">
                            <p className="text-sm text-cyan-100">
                                1) Scan QR code ini di authenticator app.
                            </p>
                            <img
                                src={twoFactorSetupData.qrCodeDataUri}
                                alt="QR code 2FA"
                                className="h-44 w-44 rounded-xl bg-white p-2"
                            />
                            <p className="text-xs text-cyan-100/90">
                                Atau manual secret: <span className="font-mono">{twoFactorSetupData.secret}</span>
                            </p>
                            <p className="text-sm text-cyan-100">
                                2) Simpan recovery code ini (hanya tampil sekali):
                            </p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {twoFactorSetupData.recoveryCodes.map((code) => (
                                    <code
                                        key={code}
                                        className="rounded-lg border border-cyan-200/20 bg-slate-900/60 px-3 py-2 text-xs text-cyan-100"
                                    >
                                        {code}
                                    </code>
                                ))}
                            </div>

                            <form
                                className="space-y-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.post(
                                        route('profile.two-factor.confirm', {}, false),
                                        {
                                            current_password: twoFactorPassword,
                                            code: twoFactorCode,
                                        },
                                        {
                                            preserveScroll: true,
                                            onError: (errors) => {
                                                setTwoFactorError(
                                                    errors.two_factor_code ??
                                                        errors.code ??
                                                        errors.current_password ??
                                                        'Kode OTP tidak valid.',
                                                );
                                            },
                                            onSuccess: () => {
                                                setTwoFactorError(null);
                                                setTwoFactorSetupData(null);
                                                setTwoFactorCode('');
                                                setNewRecoveryCodes(null);
                                            },
                                        },
                                    );
                                }}
                            >
                                <Input
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
                                    placeholder="Masukkan OTP 6 digit untuk konfirmasi"
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-full bg-white text-slate-900 hover:bg-white/90"
                                >
                                    Konfirmasi Aktivasi 2FA
                                </Button>
                            </form>
                        </div>
                    ) : null}

                    {newRecoveryCodes ? (
                        <div className="mt-4 space-y-2 rounded-2xl border border-amber-300/25 bg-amber-500/10 p-4">
                            <p className="text-sm text-amber-100">
                                Recovery code baru (simpan sekarang):
                            </p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {newRecoveryCodes.map((code) => (
                                    <code
                                        key={code}
                                        className="rounded-lg border border-amber-200/25 bg-slate-900/60 px-3 py-2 text-xs text-amber-100"
                                    >
                                        {code}
                                    </code>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {twoFactorError ? (
                        <p className="mt-3 text-sm text-red-300">{twoFactorError}</p>
                    ) : null}
                </AccordionCard>

                <AccordionCard title="Danger zone" className="border border-red-500/20">
                    <p className="text-sm text-white/70">
                        Delete your account permanently.
                    </p>

                    {confirmingDelete ? (
                        <form onSubmit={submitDelete} className="space-y-4">
                            <p className="text-sm text-white/70">
                                Enter your password to confirm.
                            </p>
                            <div>
                                <Input
                                    ref={deletePasswordInput}
                                    type="password"
                                    value={deleteForm.data.password}
                                    onChange={(e) =>
                                        deleteForm.setData('password', e.target.value)
                                    }
                                    className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35 focus-visible:ring-red-300/30"
                                    placeholder="Password"
                                />
                                <InputError
                                    message={deleteForm.errors.password}
                                    className="mt-2 text-red-200"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 flex-1 rounded-full border-white/15 bg-transparent text-white/90 hover:bg-white/5"
                                    onClick={() => {
                                        setConfirmingDelete(false);
                                        deleteForm.reset();
                                        deleteForm.clearErrors();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={deleteForm.processing}
                                    className="h-11 flex-1 rounded-full bg-red-500 text-white hover:bg-red-500/90"
                                >
                                    Delete
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <Button
                            type="button"
                            className="h-11 w-full rounded-full bg-red-500 text-white hover:bg-red-500/90"
                            onClick={() => setConfirmingDelete(true)}
                        >
                            Delete account
                        </Button>
                    )}
                </AccordionCard>
            </div>
        </MobileAppLayout>
    );
}

