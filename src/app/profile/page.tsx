"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { 
    ShieldCheck, 
    LogOut, 
    Camera, 
    ChevronRight, 
    CheckCircle2,
    Trash2,
    Grid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import DarkCard from '@/components/core/DarkCard';
import AccordionCard from '@/components/core/AccordionCard';
import PrimaryCTA from '@/components/core/PrimaryCTA';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function ProfilePage() {
    const router = useRouter();
    const { user: authUser } = useUser();
    
    const user = {
        name: authUser?.displayName || 'Guest User',
        email: authUser?.email || 'guest@example.com',
        avatarUrl: authUser?.photoURL || null,
        is_admin: false,
        email_verified_at: authUser?.emailVerified ? 'verified' : null,
    };

    const [journeyBadge, setJourneyBadge] = useState(12);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email
    });

    const logout = () => {
        router.push('/login');
    };

    return (
        <MobileAppLayout 
            title="Profile" 
            activeNavId="profile" 
            backHref="/today"
            rightAction={
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-95 transition-all">
                            <Grid className="h-5 w-5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2 bg-slate-900 border-white/10 text-white rounded-[24px] shadow-2xl">
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
            <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
                
                {/* Hero Profile Card Parity */}
                <DarkCard className="relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="relative group">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full object-cover ring-4 ring-white/5"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold ring-4 ring-white/5">
                                    {user.name.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <button className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 active:scale-90">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <h2 className="mt-6 text-2xl font-bold tracking-tight text-sky-400">{user.name}</h2>
                        <p className="text-amber-500/80 text-sm font-bold tracking-wide">{user.email}</p>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {user.email_verified_at ? 'Verified Account' : 'Guest Session'}
                            </span>
                        </div>
                    </div>
                </DarkCard>

                <div className="space-y-4">
                    {/* Admin Gateway Parity */}
                    {user.is_admin && (
                        <AccordionCard 
                            title="Gateway Operasional" 
                            description="Admin backoffice & status monitoring"
                            className="ring-2 ring-cyan-400/20"
                        >
                            <div className="space-y-4 pt-2">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold">Status Harian</p>
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase tracking-widest">Healthy</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed mb-4">Semua sistem berjalan normal. Tidak ada aksi mendesak yang diperlukan hari ini.</p>
                                    <div className="grid gap-2">
                                        <Button className="w-full justify-start h-11 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-xs px-4">
                                            Open Admin Control Center
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start h-11 border-white/10 bg-transparent hover:bg-white/5 text-white rounded-xl font-bold text-xs px-4">
                                            View Performance KPI
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </AccordionCard>
                    )}

                    {/* Journey Stats Parity */}
                    <AccordionCard title="Your Spiritual Journey">
                        <button 
                            onClick={() => router.push('/versehub/id/my-spiritual-journey')}
                            className="flex items-center justify-between w-full p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 group"
                        >
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">Track your growth</p>
                                <p className="text-xs text-amber-500/60 mt-1 font-bold">Lihat riwayat hafalan dan catatan batin</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {journeyBadge > 0 && (
                                    <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold">
                                        {journeyBadge}
                                    </span>
                                )}
                                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-cyan-400 transition-colors" />
                            </div>
                        </button>
                    </AccordionCard>

                    {/* Profile Information Parity */}
                    <AccordionCard title="Informasi Personal">
                        <form
                            className="space-y-5 pt-2"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                                <Input 
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-cyan-400/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
                                <Input 
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-cyan-400/50"
                                />
                            </div>
                            <PrimaryCTA label="Simpan Perubahan" size="md" />
                        </form>
                    </AccordionCard>

                    {/* Security Parity */}
                    <AccordionCard title="Keamanan & Akses">
                        <div className="space-y-6 pt-2">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Two-Factor Auth</p>
                                            <p className="text-[10px] font-bold text-amber-500/40 uppercase tracking-wider">Status: {twoFactorEnabled ? 'Aktif' : 'Tidak Aktif'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                            twoFactorEnabled ? "bg-rose-500/10 text-rose-400" : "bg-cyan-400 text-slate-950"
                                        )}
                                    >
                                        {twoFactorEnabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.2em] ml-1">Ubah Password</label>
                                <div className="grid gap-3">
                                    <Input type="password" placeholder="Password lama" className="h-12 bg-white/5 border-white/10 rounded-xl" />
                                    <Input type="password" placeholder="Password baru" className="h-12 bg-white/5 border-white/10 rounded-xl" />
                                    <Button className="w-full bg-white/10 hover:bg-white/15 h-12 rounded-xl font-bold text-sm">Update Password</Button>
                                </div>
                            </div>
                        </div>
                    </AccordionCard>

                    {/* Danger Zone Parity */}
                    <div className="pt-8">
                        <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-colors group">
                            <Trash2 className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Hapus Akun Permanen</span>
                        </button>
                        <p className="text-center mt-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">The Chosen Talks • 2024</p>
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}
