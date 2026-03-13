"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Users, Bell, ArrowLeft, MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppAccessToken } from '@/services/app-auth-token';

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

const formatDate = (value: string): string => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
    return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function WeeklyChannelIndexPage() {
    const params = useParams();
    const router = useRouter();
    const slugParam = params?.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

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
        if (!slug) return;

        let isActive = true;
        const load = async () => {
            try {
                const token = getAppAccessToken();
                const response = await fetch(`/api/channels/${slug}`, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    cache: 'no-store',
                });
                if (!response.ok) return;
                const payload = await response.json();
                if (!isActive) return;

                setChannel(payload.channel ?? null);
                setPosts(Array.isArray(payload.posts) ? payload.posts : []);
                setMemberPosts(Array.isArray(payload.memberPosts) ? payload.memberPosts : []);
            } catch {
                // Keep UI stable when API is unreachable.
            } finally {
                if (isActive) setLoading(false);
            }
        };
        load();
        return () => {
            isActive = false;
        };
    }, [slug]);

    const handleMembershipToggle = async () => {
        if (!slug || !channel) return;
        const token = getAppAccessToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/channels/${slug}/membership`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) return;
            const payload = await response.json();
            setChannel(prev => prev ? {
                ...prev,
                is_joined: Boolean(payload.is_joined),
                members_count: typeof payload.members_count === 'number' ? payload.members_count : prev.members_count,
            } : prev);
        } catch {
            // Keep UI responsive on transient failures.
        }
    };

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
                        <button
                            onClick={handleMembershipToggle}
                            className={cn(
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
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{formatDate(post.publish_at)}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-900 transition-colors" />
                            </button>
                        ))}
                    </div>
                    {posts.length === 0 && (
                        <div className="rounded-[24px] border border-dashed border-slate-200 p-8 text-center bg-white/70">
                            <p className="text-sm font-semibold text-slate-500">Belum ada konten mingguan dipublikasikan.</p>
                        </div>
                    )}
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
