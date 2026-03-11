"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import SegmentedTabs from '@/components/core/SegmentedTabs';
import { cn } from '@/lib/utils';

const visitors = [
    {
        title: 'Delivery - Dominos',
        subtitle: 'Candace Friesen',
        status: 'Pre-Approved by Chris',
        date: '23 Nov 2025',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop',
    },
    {
        title: 'Car, Uber',
        subtitle: 'Ruben Dias',
        status: 'Pre-Approved by Anderson',
        date: '23 Nov 2025',
        image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=300&auto=format&fit=crop',
    },
];

export default function GateUpdatesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('visitors');

    return (
        <MobileAppLayout title="Gate Updates" activeNavId="home" backHref="/today">
            <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
                <SegmentedTabs
                    options={[
                        { id: 'visitors', label: 'Visitors' },
                        { id: 'parcel', label: 'Parcel' },
                        { id: 'helpers', label: 'Helpers' },
                    ]}
                    activeId={activeTab}
                    onChange={setActiveTab}
                />

                {/* Pre-Approve Section Parity */}
                <div className="rounded-[32px] bg-slate-900 p-8 shadow-2xl text-white relative overflow-hidden group hover:scale-[1.01] transition-transform">
                    <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 transition-transform group-hover:rotate-0">
                         <Plus className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 mb-2">Gate Access</h2>
                        <h3 className="text-xl font-bold tracking-tight mb-2">Expected Visitors</h3>
                        <p className="text-sm text-white/50 mb-6 max-w-[200px]">Streamline visitor entry with one-click approval.</p>
                        <button className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-cyan-400 transition-colors">
                            Pre-Approve Entry
                        </button>
                    </div>
                </div>

                {/* Visitor List Parity */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">My Visitors</h2>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-400 border border-slate-200 uppercase tracking-wider">
                            23 Nov 2025
                        </span>
                    </div>
                    
                    <div className="grid gap-3">
                        {visitors.map((visitor) => (
                            <div
                                key={visitor.title}
                                className="flex items-center gap-5 rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-black/[0.02] hover:ring-slate-900/5 transition-all"
                            >
                                <img
                                    src={visitor.image}
                                    alt={visitor.title}
                                    className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-black/10"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[15px] text-slate-900 truncate">
                                        {visitor.title}
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                        {visitor.subtitle}
                                    </p>
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
                                         <div className="h-1 w-1 rounded-full bg-slate-400" />
                                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                                            {visitor.status}
                                         </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}
