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
                <div className="flex items-center gap-3 rounded-[28px] bg-surface px-5 py-3 shadow-soft ring-1 ring-border/50">
                    <IconSearch className="h-5 w-5 text-muted-foreground" />
                    <input
                        className="w-full bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
                        placeholder="Cari Pengunjung..."
                    />
                    <button className="rounded-xl bg-foreground px-4 py-2 text-[10px] font-bold text-background uppercase tracking-widest shadow-sm border border-border/50 active:scale-95 transition-all hover:bg-foreground/90">
                        Filter
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold text-foreground tracking-tight">Trending</h2>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] cursor-pointer hover:underline">View all</span>
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
                <div className="rounded-[40px] bg-surface p-2 shadow-card ring-1 ring-border/50">
                    <div className="p-6">
                        <ListItemWithChips
                            avatarUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                            title="Alex Johnson"
                            subtitle="+91 98765 43210"
                            chip="Request"
                            status="2h ago"
                            className="shadow-none ring-0 px-0 py-0 mb-6 bg-transparent"
                        />
                        
                        <p className="text-[15px] leading-relaxed text-foreground/80 font-medium px-1">
                            Mencari seseorang yang bisa mengajar piano untuk putri saya yang berusia 8 tahun. 
                            Diutamakan yang berada di lingkungan komunitas. Silakan kirim pesan jika berminat!
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-2 text-muted-foreground hover:text-rose-500 transition-colors">
                                    <Heart className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">25</span>
                                </button>
                                <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">10</span>
                                </button>
                            </div>
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-brand transition-colors">
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
