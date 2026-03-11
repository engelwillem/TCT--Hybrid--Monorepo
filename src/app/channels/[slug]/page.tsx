"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Users, Bell, ArrowLeft, MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Post = {
    id: number;
    title: string;
    publish_at: string;
};

type MemberPost = {
    id: number;
    type: string;
    title?: string | null;
    text?: string | null;
    author?: string | null;
    created_at?: string | null;
};

export default function WeeklyChannelIndexPage() {
    const params = useParams();
    const router = useRouter();
    const { slug } = params;

    const [channel, setChannel] = useState<{
        title: string;
        description: string;
        members_count: number;
        is_joined: boolean;
    } | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [memberPosts, setMemberPosts] = useState<MemberPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking parity data for Weekly Index
        setTimeout(() => {
            setChannel({
                title: slug === 'god-first' ? 'God First' : 'Weekly Series',
                description: 'Seri renungan mingguan untuk pertumbuhan iman.',
                members_count: 1240,
                is_joined: true
            });
            setPosts([
                { id: 1, title: 'Menjaga Hati di Tengah Badai', publish_at: '2024-03-10 08:00:00' },
                { id: 2, title: 'Kekuatan dalam Kelemahan', publish_at: '2024-03-03 08:00:00' },
                { id: 3, title: 'Berjalan dalam Terang', publish_at: '2024-02-25 08:00:00' },
            ]);
            setMemberPosts([
                { id: 101, type: 'text', author: 'Andi', text: 'Sangat memberkati renungan hari ini!', created_at: '2024-03-11' }
            ]);
            setLoading(false);
        }, 800);
    }, [slug]);

    if (loading || !channel) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-slate-900 pb-24">
            {/* Nav Header Parity */}
            <header className="sticky top-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4">
                <div className="mx-auto max-w-2xl flex items-center justify-between">
                    <button onClick={() => router.push('/channels')} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white active:scale-95 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="font-bold text-lg leading-tight">{channel.title}</h1>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white active:scale-95 transition-all text-slate-400">
                        <Bell className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
                {/* Channel Info Parity */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{channel.members_count} Anggota</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Community</p>
                            </div>
                        </div>
                        <button className={cn(
                            "rounded-full px-5 py-2 text-xs font-bold transition-all active:scale-95",
                            channel.is_joined ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-white shadow-lg"
                        )}>
                            {channel.is_joined ? 'Joined' : 'Join Channel'}
                        </button>
                    </div>
                </section>

                {/* Posts List Parity */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Published Posts</h3>
                    <div className="grid gap-3">
                        {posts.map(post => (
                            <button
                                key={post.id}
                                onClick={() => router.push(`/channels/${slug}/${post.publish_at.slice(0, 10)}`)}
                                className="group flex items-center justify-between p-5 rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.03] transition-all hover:ring-slate-900/10 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-[15px] text-slate-900 line-clamp-1">{post.title}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{post.publish_at.slice(0, 10)}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-900 transition-colors" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* Community Section Parity */}
                {memberPosts.length > 0 && (
                    <section className="space-y-4 pt-4 border-t border-slate-200/60">
                         <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Community Posts</h3>
                            <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                <Plus className="h-3 w-3 inline mr-1" /> Buat Post
                            </button>
                         </div>
                         <div className="grid gap-3">
                            {memberPosts.map(m => (
                                <div key={m.id} className="p-5 rounded-[28px] bg-white shadow-soft ring-1 ring-black/[0.02]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                            {m.author?.slice(0, 1)}
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-400">{m.author}</span>
                                    </div>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{m.text}</p>
                                </div>
                            ))}
                         </div>
                    </section>
                )}
            </main>
        </div>
    );
}
