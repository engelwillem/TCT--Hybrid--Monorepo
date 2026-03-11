"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Heart, MessageCircle, Share2 } from 'lucide-react';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import ListItemWithChips from '@/components/core/ListItemWithChips';
import PrimaryCTA from '@/components/core/PrimaryCTA';
import SegmentedTabs from '@/components/core/SegmentedTabs';
import { IconSearch } from '@/components/icons/AppIcons';
import { cn } from '@/lib/utils';

export default function VisitorsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');

    return (
        <MobileAppLayout title="Visitors" activeNavId="library" backHref="/today">
            <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
                {/* Search Bar Parity */}
                <div className="flex items-center gap-3 rounded-[28px] bg-white px-5 py-3 shadow-soft ring-1 ring-black/[0.03]">
                    <IconSearch className="h-5 w-5 text-slate-400" />
                    <input
                        className="w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-300"
                        placeholder="Cari Pengunjung..."
                    />
                    <button className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-bold text-white uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Filter
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Trending</h2>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] cursor-pointer hover:underline">View all</span>
                    </div>
                    <SegmentedTabs
                        options={[
                            { id: 'general', label: 'Umum' },
                            { id: 'event', label: 'Acara' },
                            { id: 'classified', label: 'Iklan Baris' },
                        ]}
                        activeId={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                {/* Visitor Post Card Parity */}
                <div className="rounded-[40px] bg-white p-2 shadow-xl ring-1 ring-black/[0.04]">
                    <div className="p-6">
                        <ListItemWithChips
                            avatarUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                            title="Alex Johnson"
                            subtitle="+91 98765 43210"
                            chip="Request"
                            status="2h ago"
                            className="shadow-none ring-0 px-0 py-0 mb-6 bg-transparent"
                        />
                        
                        <p className="text-[15px] leading-relaxed text-slate-700 font-medium px-1">
                            Mencari seseorang yang bisa mengajar piano untuk putri saya yang berusia 8 tahun. 
                            Diutamakan yang berada di lingkungan komunitas. Silakan kirim pesan jika berminat!
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors">
                                    <Heart className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">25</span>
                                </button>
                                <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">10</span>
                                </button>
                            </div>
                            <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-500 transition-colors">
                                <Share2 className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Share</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create Action Parity */}
                <div className="fixed bottom-24 inset-x-0 px-4 flex justify-center z-40">
                    <div className="max-w-2xl w-full">
                        <PrimaryCTA 
                            label="Create Post" 
                            icon={<Plus className="h-5 w-5" />} 
                            className="shadow-2xl shadow-cyan-400/40"
                        />
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}
