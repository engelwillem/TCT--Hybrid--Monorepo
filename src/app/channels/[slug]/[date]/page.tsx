"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2, Users, MessageSquare, BookOpen, Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppAccessToken } from '@/services/app-auth-token';

type Post = {
    title: string;
    content: string;
    publish_at: string;
};

type MemberPost = {
    id: number;
    type: string;
    text?: string | null;
    author?: string | null;
    created_at?: string | null;
};

export default function WeeklyChannelPostPage() {
    const params = useParams();
    const router = useRouter();
    const slugParam = params?.slug;
    const dateParam = params?.date;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;

    const [channel, setChannel] = useState<{
        title: string;
        members_count: number;
        is_joined: boolean;
    } | null>(null);
    const [post, setPost] = useState<Post | null>(null);
    const [memberPosts, setMemberPosts] = useState<MemberPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        if (!slug || !date) return;

        let isActive = true;
        const load = async () => {
            try {
                const token = getAppAccessToken();
                const response = await fetch(`/api/channels/${slug}/${date}`, {
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
                if (payload.post) {
                    setPost({
                        title: payload.post.title ?? '',
                        content: payload.post.content ?? '',
                        publish_at: payload.post.publish_at ?? date,
                    });
                }
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
    }, [slug, date]);

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

    if (loading || !post || !channel) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-slate-900 pb-24">
            {/* Header Parity */}
            <header className="sticky top-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
                <div className="mx-auto max-w-2xl flex items-center justify-between">
                    <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white active:scale-95 transition-all">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{channel.title}</p>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{post.title}</p>
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white active:scale-95 transition-all text-slate-400">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
                {/* Stats Card Parity */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-soft ring-1 ring-black/[0.02]">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-500">{channel.members_count} Members</span>
                    </div>
                    <button onClick={handleMembershipToggle} className="text-[11px] font-bold text-slate-900 bg-slate-100 px-4 py-1.5 rounded-full">
                        {channel.is_joined ? '✓ Joined' : 'Join'}
                    </button>
                </div>

                {/* Content Article Parity */}
                <article className="rounded-[40px] bg-white shadow-xl ring-1 ring-black/[0.04] overflow-hidden">
                    <div className="p-8 md:p-12">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-6">{post.publish_at}</p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
                            {post.title}
                        </h1>
                        
                        <div 
                            dangerouslySetInnerHTML={{ __html: post.content }}
                            className="reader-prose text-[17px] leading-relaxed text-slate-700 space-y-6"
                        />
                    </div>
                    
                    {/* Action Bar inside card Parity */}
                    <div className="border-t border-slate-50 p-6 flex items-center justify-center gap-4">
                         <button 
                            onClick={() => setLiked(!liked)}
                            className={cn(
                                "h-12 w-12 flex items-center justify-center rounded-full transition-all active:scale-90",
                                liked ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                            )}
                         >
                            <Heart className={cn("h-5 w-5", liked ? "fill-rose-500" : "")} />
                         </button>
                         <button className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 active:scale-90">
                            <Bookmark className="h-5 w-5" />
                         </button>
                         <button className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 active:scale-90">
                            <MessageSquare className="h-5 w-5" />
                         </button>
                    </div>
                </article>

                {/* Community Feedback Parity */}
                {memberPosts.length > 0 && (
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Community Thoughts</h3>
                        <div className="grid gap-3">
                            {memberPosts.map(m => (
                                <div key={m.id} className="p-5 rounded-[32px] bg-slate-900/5 ring-1 ring-black/[0.02]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                            {m.author?.slice(0, 1)}
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500">{m.author}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{m.text}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
