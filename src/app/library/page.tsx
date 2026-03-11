"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import ListItemWithChips from '@/components/core/ListItemWithChips';
import SegmentedTabs from '@/components/core/SegmentedTabs';
import { IconSearch } from '@/components/icons/AppIcons';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('upcoming');

    return (
        <MobileAppLayout title="Community" activeNavId="library" backHref="/today">
            <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                {/* Search Bar Parity */}
                <div className="flex items-center gap-3 rounded-[24px] bg-white px-5 py-4 shadow-soft ring-1 ring-black/[0.02] focus-within:ring-slate-900/10 transition-all">
                    <IconSearch className="h-5 w-5 text-slate-300" />
                    <input
                        className="w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-300"
                        placeholder="Cari di Komunitas..."
                    />
                </div>

                <div className="space-y-6">
                    <SegmentedTabs
                        options={[
                            { id: 'upcoming', label: 'Mendatang' },
                            { id: 'history', label: 'Riwayat' },
                        ]}
                        activeId={activeTab}
                        onChange={setActiveTab}
                    />
                    
                    <div className="grid gap-3 pt-2">
                        {/* 
                            In Next.js, we link to /versehub/[lang]
                        */}
                        <ListItemWithChips
                            onClick={() => router.push('/versehub/id')}
                            title="VerseHub Library"
                            subtitle="Telusuri & cari Ayat-ayat Alkitab"
                            chip="Bible"
                            status="Open"
                            meta="ID / EN"
                            className="ring-2 ring-cyan-400/20"
                        />

                        <ListItemWithChips
                            avatarUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                            title="Scheduled Post"
                            subtitle="Akan dipublikasikan secara otomatis"
                            chip="Upcoming"
                            status="Planned"
                            meta="BESOK"
                        />

                        <ListItemWithChips
                            avatarUrl="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop"
                            title="Published Post"
                            subtitle="Sudah diverifikasi oleh mentor"
                            chip="History"
                            status="Done"
                            meta="KEMARIN"
                        />
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}
