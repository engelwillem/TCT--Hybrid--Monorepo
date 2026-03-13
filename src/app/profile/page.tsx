"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import {
    ShieldCheck,
    LogOut,
    Camera,
    ChevronRight,
    CheckCircle2,
    Trash2,
    Grid,
    Sparkles,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import DarkCard from '@/components/core/DarkCard';
import AccordionCard from '@/components/core/AccordionCard';
import PrimaryCTA from '@/components/core/PrimaryCTA';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { clearAppAccessToken, getAppAccessToken } from '@/services/app-auth-token';

type OpsGatewayData = {
    status: 'Healthy' | 'Needs Attention' | 'High Risk' | string;
    riskScore: number;
    topAction: string;
    statusHref?: string;
};

type ApiProfilePayload = {
    data?: {
        user?: {
            id?: string;
            name?: string;
            email?: string;
            is_admin?: boolean;
            email_verified_at?: string | null;
            avatar_url?: string | null;
        };
        opsGateway?: OpsGatewayData;
        twoFactor?: {
            enabled?: boolean;
            recoveryCodesRemaining?: number;
        };
    };
};

export default function ProfilePage() {
    const router = useRouter();
    const { user: authUser } = useUser();
    const [loading, setLoading] = useState(true);
    const [submittingAvatar, setSubmittingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState({
        name: authUser?.displayName || 'Guest User',
        email: authUser?.email || 'guest@example.com',
        avatarUrl: authUser?.photoURL || null,
        is_admin: false,
        email_verified_at: authUser?.emailVerified ? 'verified' : null,
    });

    const [opsGateway, setOpsGateway] = useState<OpsGatewayData | null>(null);
    const [journeyBadge, setJourneyBadge] = useState(0);
    const [twoFactor, setTwoFactor] = useState({
        enabled: false,
        recoveryCodesRemaining: 0
    });
    
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email,
    });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const token = getAppAccessToken();
        if (!token) {
            setLoading(false);
            return;
        }

        let isActive = true;
        const loadProfile = async () => {
            try {
                const response = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });
                if (!response.ok) return;

                const payload = (await response.json()) as ApiProfilePayload;
                const apiUser = payload?.data?.user;
                if (!isActive || !apiUser) return;

                const nextUser = {
                    name: apiUser.name || 'Guest User',
                    email: apiUser.email || 'guest@example.com',
                    avatarUrl: apiUser.avatar_url || authUser?.photoURL || null,
                    is_admin: Boolean(apiUser.is_admin),
                    email_verified_at: apiUser.email_verified_at || null,
                };

                setUser(nextUser);
                if (payload?.data && 'opsGateway' in payload.data) {
                    setOpsGateway(payload.data.opsGateway || null);
                }
                setProfileData({
                    name: nextUser.name,
                    email: nextUser.email,
                });
                setTwoFactor({
                    enabled: Boolean(payload?.data?.twoFactor?.enabled),
                    recoveryCodesRemaining: payload?.data?.twoFactor?.recoveryCodesRemaining || 0
                });
            } catch {
                // Keep fallback UI state.
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            isActive = false;
        };
    }, [authUser?.photoURL]);

    useEffect(() => {
        if (!user.is_admin) return;
        
        let isActive = true;
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/versehub/reader-actions/summary?limit=1', {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const json = await res.json();
                if (isActive) setJourneyBadge(json?.total ?? 0);
            } catch {
                // ignore
            }
        };
        fetchSummary();
        return () => { isActive = false; };
    }, [user.is_admin]);

    const logout = () => {
        clearAppAccessToken();
        router.push('/');
    };

    const handleAvatarUpload = async (file: File) => {
        const token = getAppAccessToken();
        if (!token) return;

        setSubmittingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('_method', 'PATCH');

        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (response.ok) {
                const payload = await response.json();
                if (payload?.data?.user?.avatar_url) {
                    setUser(prev => ({ ...prev, avatarUrl: payload.data.user.avatar_url }));
                }
            }
        } catch {
            // ignore
        } finally {
            setSubmittingAvatar(false);
        }
    };

    const handleProfileSave = async (event: React.FormEvent) => {
        event.preventDefault();
        const token = getAppAccessToken();
        if (!token) return;

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });
            if (!response.ok) return;

            const payload = await response.json();
            const updated = payload?.data;
            if (!updated) return;

            setUser((prev) => ({
                ...prev,
                name: updated.name ?? prev.name,
                email: updated.email ?? prev.email,
            }));
        } catch {
            // Keep current state.
        }
    };

    const handlePasswordUpdate = async () => {
        const token = getAppAccessToken();
        if (!token || !currentPassword || !newPassword || !confirmPassword) return;

        try {
            const response = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword,
                }),
            });
            if (!response.ok) return;

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            // Keep current state.
        }
    };

    const handleTwoFactorToggle = async () => {
        // This is a simplified version of the logic in legacy Profile.tsx
        // In a real decoupled app, we'd open a modal or use a more sophisticated flow.
        const token = getAppAccessToken();
        if (!token) return;

        if (!twoFactor.enabled) {
            const password = window.prompt('Masukkan password saat ini untuk mengaktifkan 2FA:');
            if (!password) return;

            try {
                const setupRes = await fetch('/api/profile/two-factor/setup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ current_password: password }),
                });
                if (!setupRes.ok) return;
                const setupData = await setupRes.json();
                
                // Show QR code info in a simple way for now
                window.alert(`Secret: ${setupData.data.secret}\nSimpan recovery codes: ${setupData.data.recoveryCodes.join(', ')}`);

                const code = window.prompt('Masukkan kode OTP authenticator untuk konfirmasi 2FA:');
                if (!code) return;

                const confirmRes = await fetch('/api/profile/two-factor/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        current_password: password,
                        code,
                    }),
                });
                if (confirmRes.ok) setTwoFactor(prev => ({ ...prev, enabled: true }));
            } catch {
                // Keep current state.
            }
            return;
        }

        const password = window.prompt('Masukkan password saat ini untuk menonaktifkan 2FA:');
        if (!password) return;
        const code = window.prompt('Masukkan OTP atau recovery code:');
        if (!code) return;

        try {
            const disable = await fetch('/api/profile/two-factor', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: password,
                    code,
                }),
            });
            if (disable.ok) setTwoFactor(prev => ({ ...prev, enabled: false }));
        } catch {
            // Keep current state.
        }
    };

    const handleDeleteAccount = async () => {
        const token = getAppAccessToken();
        if (!token) return;
        const password = window.prompt('Masukkan password untuk konfirmasi hapus akun:');
        if (!password) return;

        try {
            const response = await fetch('/api/profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            });
            if (!response.ok) return;
            clearAppAccessToken();
            router.push('/');
        } catch {
            // Keep current state.
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20">Loading Secure Profile...</p>
            </div>
        );
    }

    const firstName = user.name.split(' ')[0];

    return (
        <MobileAppLayout
            title="Profile"
            activeNavId="profile"
            backHref="/today"
            rightAction={
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 text-slate-400 shadow-soft hover:text-white transition-all ring-1 ring-white/10 backdrop-blur-md">
                            <Grid className="h-5 w-5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2 bg-slate-900/90 border-white/10 text-white rounded-[24px] shadow-2xl backdrop-blur-xl">
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-rose-400"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-bold">Log out</span>
                        </button>
                    </PopoverContent>
                </Popover>
            }
        >
            <div className="mx-auto max-w-[640px] px-6 py-8 space-y-8 animate-in fade-in duration-1000">
                <DarkCard className="relative overflow-hidden group/profile-card">
                    {/* Background Decorative */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/5 blur-3xl transition-opacity duration-1000 group-hover/profile-card:opacity-20" />
                    <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl transition-opacity duration-1000 group-hover/profile-card:opacity-20" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="relative">
                            {/* Avatar Glow */}
                            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-400 via-cyan-400 to-emerald-400 opacity-20 blur-xl transition duration-700 group-hover/profile-card:opacity-40 animate-pulse" />
                            
                            <div className="relative h-28 w-28 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden ring-4 ring-white/10 shadow-2xl transition-transform duration-700 group-hover/profile-card:scale-105">
                                {submittingAvatar ? (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                                    </div>
                                ) : null}
                                
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-4xl font-black text-sky-400 tracking-tighter">
                                        {user.name.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shadow-lg transform transition-all hover:scale-110 active:scale-90 hover:shadow-sky-400/20"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input 
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAvatarUpload(file);
                                }}
                            />
                        </div>

                        <div className="mt-8 space-y-1">
                            <h2 className="text-3xl font-black tracking-tighter text-sky-400 leading-tight">
                                {user.name}
                            </h2>
                            <p className="text-amber-500 font-bold tracking-wide text-sm">
                                {user.email}
                            </p>
                        </div>

                        <div className="mt-6">
                            <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all",
                                user.email_verified_at 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]" 
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            )}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>
                                    {user.email_verified_at ? 'Verified Account' : 'Guest Session'}
                                </span>
                            </div>
                        </div>
                    </div>
                </DarkCard>

                <div className="space-y-4">
                    {user.is_admin && (
                        <AccordionCard
                            title="Gateway Operasional"
                            className="ring-2 ring-sky-400/20 bg-sky-400/[0.02]"
                        >
                            <div className="space-y-4 pt-2">
                                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-inner">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                                        <div>
                                            <p className="text-sm font-black text-white/90">Welcome back, {firstName}.</p>
                                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Control Center Access</p>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-widest text-center shadow-lg",
                                            opsGateway?.status === 'High Risk'
                                                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                                : opsGateway?.status === 'Needs Attention'
                                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                        )}>
                                            Status: {opsGateway?.status ?? 'Healthy'}
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 mb-6">
                                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-2 px-1">Aksi Prioritas</p>
                                        <p className="text-sm text-white/70 leading-relaxed font-medium">
                                            {opsGateway?.topAction ?? 'Semua sistem berjalan normal. Lanjutkan monitoring rutin.'}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Button 
                                            onClick={() => window.open(opsGateway?.statusHref || '/settings/ops-visibility', '_blank')}
                                            className="w-full h-12 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Open Ops Triage
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => router.push('/settings/kpi-dashboard')}
                                            className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            KPI Dashboard
                                        </Button>
                                    </div>
                                    
                                    <div className="mt-4 text-center">
                                        <a
                                            href="/admintalk"
                                            className="text-[10px] font-black text-sky-400/50 uppercase tracking-[0.3em] hover:text-sky-400 transition-colors"
                                        >
                                            Backoffice Entry →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </AccordionCard>
                    )}

                    <AccordionCard title="Your Spiritual Journey">
                        <button
                            onClick={() => router.push('/versehub/id/my-spiritual-journey')}
                            className="flex items-center justify-between w-full p-6 rounded-[28px] bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/10 group shadow-lg backdrop-blur-md"
                        >
                            <div className="text-left space-y-1">
                                <p className="text-lg font-black text-white tracking-tight">Growth Monitoring</p>
                                <p className="text-xs text-amber-500/70 font-bold uppercase tracking-widest">Riwayat hafalan & catatan batin</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {journeyBadge > 0 && (
                                    <span className="h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-black shadow-[0_4px_12px_rgba(244,63,94,0.3)]">
                                        {journeyBadge}
                                    </span>
                                )}
                                <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-sky-400 group-hover:text-slate-950 transition-all duration-500">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </button>
                    </AccordionCard>

                    <AccordionCard title="Informasi Personal">
                        <form className="space-y-6 pt-2" onSubmit={handleProfileSave}>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.25em] ml-2">Nama Lengkap</label>
                                <Input 
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="h-13 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-sky-400/50 text-[16px] font-bold px-5"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.25em] ml-2">Alamat Email</label>
                                <Input 
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="h-13 bg-white/[0.03] border-white/10 rounded-2xl focus:ring-sky-400/50 text-[16px] font-bold px-5"
                                />
                            </div>
                            <div className="pt-2">
                                <PrimaryCTA label="Simpan Perubahan" size="md" />
                            </div>
                        </form>
                    </AccordionCard>

                    <AccordionCard title="Keamanan & Akses">
                        <div className="space-y-8 pt-2">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-5 rounded-[28px] bg-white/[0.02] border border-white/10 shadow-lg backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-sky-400/10 flex items-center justify-center text-sky-400 shadow-inner">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-white tracking-tight">Two-Factor Auth</p>
                                            <p className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest mt-0.5">
                                                Status: {twoFactor.enabled ? 'Aktif' : 'Tidak Aktif'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleTwoFactorToggle}
                                        className={cn(
                                            "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-md active:scale-95",
                                            twoFactor.enabled 
                                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                                : "bg-sky-400 text-slate-950 shadow-sky-400/20"
                                        )}
                                    >
                                        {twoFactor.enabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                                {twoFactor.enabled && (
                                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">
                                        Recovery code tersisa: {twoFactor.recoveryCodesRemaining}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.25em] ml-2">Ubah Password</label>
                                <div className="grid gap-4">
                                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Password lama" className="h-13 bg-white/[0.03] border-white/10 rounded-2xl px-5 font-bold" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="h-13 bg-white/[0.03] border-white/10 rounded-2xl px-5 font-bold" />
                                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi password" className="h-13 bg-white/[0.03] border-white/10 rounded-2xl px-5 font-bold" />
                                    </div>
                                    <Button 
                                        type="button" 
                                        onClick={handlePasswordUpdate} 
                                        className="w-full bg-white/10 hover:bg-white/15 h-13 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-[0.98]"
                                    >
                                        Memperbarui Sandi
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </AccordionCard>

                    <div className="pt-12 text-center space-y-6">
                        <button 
                            type="button" 
                            onClick={handleDeleteAccount} 
                            className="group mx-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-rose-500/10 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-500"
                        >
                            <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hapus Akun Permanen</span>
                        </button>
                        
                        <div className="flex flex-col items-center gap-2">
                             <div className="h-px w-12 bg-white/5" />
                             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mt-4">TCT MONOREPO • 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}
