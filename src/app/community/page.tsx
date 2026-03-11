'use client';

import MobileAppLayout from '@/layouts/MobileAppLayout';
import MemberPostCard from '@/components/community/MemberPostCard';
import CommentsSheet, { type SheetComment } from '@/components/community/CommentsSheet';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import VerseHubFeaturedCard, { type FeaturedVerse } from '@/components/versehub/VerseHubFeaturedCard';
import PostComposer from '@/components/community/PostComposer';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type ArchiveCategory = 'all' | 'quotes' | 'reflections' | 'prayer_requests' | 'testimonies';

type CommunityPost = {
    id: number;
    type: string;
    type_label: string;
    text: string | null;
    title?: string | null;
    image_path: string | null;
    thumb_path: string | null;
    media_paths?: string[] | null;
    metadata: any;
    created_at: string | null;
    expires_at?: string | null;
    author: {
        id: number | null;
        name: string | null;
        avatar_url?: string | null;
        is_official: boolean;
    };
    stats: {
        pray_count: number;
        comments_count: number;
        bookmarks_count: number;
    };
    interactions: {
        is_prayed: boolean;
        is_bookmarked: boolean;
    };
    is_featured: boolean;
    can_moderate: boolean;
};

function postToCardProps(
    p: CommunityPost,
    options?: {
        onPray?: (id: number) => void;
        onBookmark?: (id: number) => void;
        onOpenComments?: (id: number) => void;
        onShare?: (id: number) => void;
        onAdminHide?: (id: number) => void;
    },
) {
    const author = p?.author ?? { id: null, name: 'Unknown', is_official: false };
    const stats = p?.stats ?? { pray_count: 0, comments_count: 0, bookmarks_count: 0 };
    const interactions = p?.interactions ?? { is_prayed: false, is_bookmarked: false };
    const metadata = p && typeof p.metadata === 'object' && p.metadata ? p.metadata : {};
    
    const mediaFromMeta = Array.isArray((metadata as any).media_paths)
        ? (metadata as any).media_paths
        : [];

    const rawAspectRatio = (metadata as any).media_aspect_ratio;
    const aspectRatio: 'auto' | '4:5' | 'og' =
        rawAspectRatio === '4:5' || rawAspectRatio === 'og' ? rawAspectRatio : 'auto';
    const rawTextPosition = (metadata as any).text_position;
    const textPosition: 'above' | 'below' = rawTextPosition === 'above' ? 'above' : 'below';

    return {
        key: p.id,
        authorName: author.name ?? 'Unknown',
        authorAvatar: author.avatar_url,
        isOfficial: Boolean(author.is_official),
        type: p.type,
        text: p.text,
        imgSrc: p.thumb_path ?? p.image_path,
        mediaSrcList: Array.isArray(p.media_paths) ? p.media_paths : mediaFromMeta,
        prayLabel: String(stats.pray_count ?? 0),
        prayed: Boolean(interactions.is_prayed),
        commentsCount: stats.comments_count ?? 0,
        bookmarked: Boolean(interactions.is_bookmarked),
        bookmarkLabel: String(stats.bookmarks_count ?? 0),
        onPray: () => options?.onPray?.(p.id),
        onOpenComments: () => options?.onOpenComments?.(p.id),
        onShare: () => options?.onShare?.(p.id),
        onBookmark: () => options?.onBookmark?.(p.id),
        canModerate: p.can_moderate,
        onAdminHide: () => options?.onAdminHide?.(p.id),
        aspectRatio,
        textPosition,
    };
}

const slugifyRef = (ref: unknown) =>
    String(ref ?? '')
        .toLowerCase()
        .trim()
        .replace(/[:\.\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

export default function CommunityPage() {
    const router = useRouter();
    const isDesktop = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false;
    
    // Mock data for initial parity
    const posts: CommunityPost[] = [
        {
            id: 101,
            type: 'user_post',
            type_label: 'Diskusi',
            text: 'Tuhan itu baik, dalam segala waktu.',
            image_path: null,
            thumb_path: null,
            metadata: {},
            created_at: new Date().toISOString(),
            author: { id: 1, name: 'Budi', is_official: false },
            stats: { pray_count: 5, comments_count: 2, bookmarks_count: 1 },
            interactions: { is_prayed: false, is_bookmarked: false },
            is_featured: false,
            can_moderate: false
        }
    ];

    const rituals = {
        today_verse: {
            ref: 'Mzm 23:1',
            text: 'TUHAN adalah gembalaku, takkan kekurangan aku.',
            reference: 'Mazmur 23:1'
        }
    };

    const channels = [
        { id: 1, slug: 'discussions', title: 'Diskusi Umum' },
        { id: 2, slug: 'prayer', title: 'Permohonan Doa' }
    ];

    const [activeTab, setActiveTab] = useState<'discussions' | 'archive' | 'bookmarks'>('discussions');
    const [discussionPosts, setDiscussionPosts] = useState<CommunityPost[]>(posts);
    const [archivedItems, setArchivedItems] = useState<CommunityPost[]>([]);
    const [archiveCategory, setArchiveCategory] = useState<ArchiveCategory>('all');
    const [archiveExpanded, setArchiveExpanded] = useState<Record<string, boolean>>({});
    const [archiveVisibleCount, setArchiveVisibleCount] = useState<Record<string, number>>({});
    const [commentPostId, setCommentPostId] = useState<number | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsByPost, setCommentsByPost] = useState<Record<number, SheetComment[]>>({});
    const [replyTarget, setReplyTarget] = useState<SheetComment | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const archiveGroups = useMemo(() => {
        const filtered = archivedItems.filter((post) => {
            if (archiveCategory === 'all') return true;
            const typeMapping: Record<string, string> = {
                quotes: 'quote',
                reflections: 'reflection',
                prayer_requests: 'prayer_request',
                testimonies: 'testimony',
            };
            return post.type === (typeMapping[archiveCategory] ?? archiveCategory);
        });

        const map = new Map<string, CommunityPost[]>();
        const now = new Date();
        const todayKey = now.toISOString().slice(0, 10);

        filtered.forEach((p) => {
            const ts = p.created_at ? Date.parse(p.created_at) : NaN;
            const d = Number.isFinite(ts) ? new Date(ts) : new Date(0);
            const dateKey = d.toISOString().slice(0, 10);
            const key = dateKey === todayKey ? 'today' : `month-${dateKey.slice(0, 7)}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        });

        return Array.from(map.entries())
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, items]) => ({
                key,
                label: key === 'today' ? 'Today' : key.replace('month-', ''),
                items: items.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
            }));
    }, [archivedItems, archiveCategory]);

    const effectiveFeaturedVerse = useMemo(() => {
        const ritualVerse = rituals?.today_verse ?? null;
        const ritualRawRef = ritualVerse?.ref ?? ritualVerse?.reference ?? '';
        const ritualRef = slugifyRef(ritualRawRef);
        const ritualText = String(ritualVerse?.text ?? '').trim();

        if (ritualRef && ritualText) {
            return {
                ref: ritualRef,
                href: `/versehub/id/${ritualRef}`,
                text: ritualText,
                reference: ritualVerse?.reference || ritualRawRef,
            } as FeaturedVerse;
        }

        return {
            ref: 'mazmur-23-1',
            href: '/versehub/id/mazmur-23-1',
            text: 'TUHAN adalah gembalaku, takkan kekurangan aku.',
            reference: 'Mazmur 23:1',
        } as FeaturedVerse;
    }, [rituals]);

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 1400);
    };

    const mutatePostEverywhere = (postId: number, updater: (post: CommunityPost) => CommunityPost) => {
        setDiscussionPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
        setArchivedItems((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
    };

    const onTogglePray = (postId: number) => {
        mutatePostEverywhere(postId, (post) => {
            const nextPrayed = !post.interactions.is_prayed;
            return {
                ...post,
                interactions: { ...post.interactions, is_prayed: nextPrayed },
                stats: {
                    ...post.stats,
                    pray_count: Math.max(0, post.stats.pray_count + (nextPrayed ? 1 : -1)),
                },
            };
        });
        showToast('Operation successful');
    };

    const onToggleBookmark = (postId: number) => {
        mutatePostEverywhere(postId, (post) => {
            const nextSaved = !post.interactions.is_bookmarked;
            return {
                ...post,
                interactions: { ...post.interactions, is_bookmarked: nextSaved },
                stats: {
                    ...post.stats,
                    bookmarks_count: Math.max(0, post.stats.bookmarks_count + (nextSaved ? 1 : -1)),
                },
            };
        });
        showToast('Bookmarks updated');
    };

    const openComments = async (postId: number) => {
        setCommentPostId(postId);
        setCommentsOpen(true);
        // Mock comments loading
        setCommentsByPost(prev => ({ ...prev, [postId]: [] }));
    };

    const submitComment = async (text: string) => {
        if (!commentPostId) return;
        showToast('Comment posted');
        mutatePostEverywhere(commentPostId, (post) => ({
            ...post,
            stats: { ...post.stats, comments_count: post.stats.comments_count + 1 }
        }));
    };

    return (
        <MobileAppLayout title="Community" activeNavId="library" backHref="/today">
            <div className="mx-auto w-full max-w-[640px] space-y-4 px-4 pb-28 md:px-0">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-10%" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <VerseHubFeaturedCard
                        verse={effectiveFeaturedVerse}
                        postId={discussionPosts.find(p => p.is_featured)?.id}
                        onOpenComments={openComments}
                    />
                </motion.div>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                    className="space-y-6"
                >
                    <div className="sticky top-0 z-40 py-2 -mx-1 px-1">
                        <TabsList className="relative flex h-[52px] w-full items-center justify-between rounded-[20px] bg-slate-200/50 dark:bg-slate-800/10 p-1.5 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                            {['discussions', 'archive', 'bookmarks'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className={cn(
                                        "relative flex-1 h-full rounded-[14px] text-[13px] font-black uppercase tracking-widest transition-all duration-300 z-10",
                                        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-brand dark:data-[state=active]:text-white",
                                        "data-[state=active]:shadow-[0_8px_20px_rgba(0,0,0,0.12)] data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-slate-400"
                                    )}
                                >
                                    {tab === 'discussions' ? 'Diskusi' : tab === 'archive' ? 'Arsip' : 'Simpanan'}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="discussions" className="space-y-4 mt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, margin: "-5%" }}
                            transition={{ duration: 0.5 }}
                        >
                            <PostComposer className="shadow-card" channels={channels} />
                        </motion.div>

                        <AnimatePresence>
                            {discussionPosts.map((p, index) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{
                                        duration: 0.35,
                                        delay: isDesktop ? Math.min(index * 0.05, 0.2) : 0,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                >
                                    <MemberPostCard
                                        {...postToCardProps(p, {
                                            onPray: onTogglePray,
                                            onBookmark: onToggleBookmark,
                                            onOpenComments: openComments,
                                            onShare: (id) => { if (navigator.share) navigator.share({ title: 'Post', url: window.location.href }) },
                                            onAdminHide: (id) => setDiscussionPosts(prev => prev.filter(x => x.id !== id))
                                        })}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </TabsContent>

                    <TabsContent value="archive" className="space-y-4">
                        <Card className="rounded-3xl bg-surface shadow-soft p-12 text-center opacity-60">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Fitur Arsip Segera Hadir</p>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bookmarks">
                        <Card className="rounded-3xl bg-surface shadow-soft p-12 text-center opacity-60">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Simpanan Anda Kosong</p>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <CommentsSheet
                open={commentsOpen}
                onClose={() => setCommentsOpen(false)}
                comments={commentPostId ? (commentsByPost[commentPostId] ?? []) : []}
                title={commentsLoading ? 'Comments (loading...)' : 'Comments'}
                onReply={(comment) => setReplyTarget(comment)}
                replyingToAuthor={replyTarget?.author ?? null}
                onCancelReply={() => setReplyTarget(null)}
                onSubmit={submitComment}
            />

            {toast && (
                <div className="fixed left-1/2 top-6 z-[80] -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white ring-1 ring-white/10 backdrop-blur">
                    {toast}
                </div>
            )}
        </MobileAppLayout>
    );
}
