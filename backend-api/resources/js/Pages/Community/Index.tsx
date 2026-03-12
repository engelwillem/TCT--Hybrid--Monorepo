import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MemberPostCard from '@/Components/community/MemberPostCard';
import CommentsSheet, { type SheetComment } from '@/Components/community/CommentsSheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import VerseHubFeaturedCard, { type FeaturedVerse } from '@/Components/versehub/VerseHubFeaturedCard';
import PostComposer from '@/Components/community/PostComposer';
import { motion, AnimatePresence } from 'framer-motion';

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

// Remove client-side detection logic as it's now handled by backend enums

function postToCardProps(
    p: CommunityPost,
    options?: {
        onPray?: (id: number) => void;
        onBookmark?: (id: number) => void;
        onOpenComments?: (id: number) => void;
        onShare?: (id: number) => void;
        onAdminHide?: (id: number) => void;
        onAdminExtend24h?: (id: number) => void;
        onAdminExpireNow?: (id: number) => void;
    },
) {
    const author = p?.author ?? { id: null, name: 'Unknown', is_official: false };
    const stats = p?.stats ?? { pray_count: 0, comments_count: 0, bookmarks_count: 0 };
    const interactions = p?.interactions ?? { is_prayed: false, is_bookmarked: false };
    const metadata = p && typeof p.metadata === 'object' && p.metadata ? p.metadata : {};
    const mediaFromMeta = Array.isArray((metadata as { media_paths?: unknown[] }).media_paths)
        ? (metadata as { media_paths: string[] }).media_paths
        : [];

    const rawAspectRatio = (metadata as { media_aspect_ratio?: string }).media_aspect_ratio;
    const aspectRatio: 'auto' | '4:5' | 'og' =
        rawAspectRatio === '4:5' || rawAspectRatio === 'og' ? rawAspectRatio : 'auto';
    const rawTextPosition = (metadata as { text_position?: string }).text_position;
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
        onAdminExtend24h: () => options?.onAdminExtend24h?.(p.id),
        onAdminExpireNow: () => options?.onAdminExpireNow?.(p.id),
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

export default function CommunityIndex({
    posts,
    archivePosts,
    meta,
    rituals,
    channels = [],
}: {
    posts: CommunityPost[];
    archivePosts: CommunityPost[];
    meta: {
        now: string;
        feed_type: 'community';
    };
    rituals: any;
    channels?: Array<{ id: number; slug: string; title: string }>;
}) {
    const page = usePage();
    const isDesktop = useMemo(
        () => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false),
        [],
    );
    const shareOrigin = useMemo(() => {
        return typeof window !== 'undefined' ? window.location.origin : '';
    }, []);

    const [activeTab, setActiveTab] = useState<'discussions' | 'archive' | 'bookmarks'>('discussions');
    const [discussionPosts, setDiscussionPosts] = useState<CommunityPost[]>(posts ?? []);
    const [archivedItems, setArchivedItems] = useState<CommunityPost[]>(archivePosts ?? []);
    const [archiveCategory, setArchiveCategory] = useState<ArchiveCategory>('all');
    const [archiveExpanded, setArchiveExpanded] = useState<Record<string, boolean>>({});
    const [archiveVisibleCount, setArchiveVisibleCount] = useState<Record<string, number>>({});
    const [commentPostId, setCommentPostId] = useState<number | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsByPost, setCommentsByPost] = useState<Record<number, SheetComment[]>>({});
    const [replyTarget, setReplyTarget] = useState<SheetComment | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        // Render server feed as-is to keep local and production output identical.
        setDiscussionPosts(posts ?? []);
    }, [posts]);

    useEffect(() => {
        setArchivedItems(archivePosts ?? []);
    }, [archivePosts]);

    const archiveGroups = useMemo(() => {
        const filtered = (archivedItems ?? []).filter((post) => {
            if (archiveCategory === 'all') return true;
            // Map UI categories to PostType enums if needed, or just direct match
            const typeMapping: Record<string, string> = {
                quotes: 'quote',
                reflections: 'reflection',
                prayer_requests: 'prayer_request',
                testimonies: 'testimony',
            };
            return post.type === (typeMapping[archiveCategory] ?? archiveCategory);
        });

        // Re-implement simplified grouping without isToday/isYesterday helpers if possible
        const map = new Map<string, CommunityPost[]>();
        const now = new Date(meta?.now && !Number.isNaN(Date.parse(meta.now)) ? meta.now : Date.now());
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
    }, [archivedItems, meta.now, archiveCategory]);

    const effectiveFeaturedVerse = useMemo(() => {
        const ritualVerse = rituals?.today_verse ?? null;
        const ritualRawRef = ritualVerse?.ref ?? ritualVerse?.verse_ref ?? ritualVerse?.reference ?? '';
        const ritualRef = slugifyRef(ritualRawRef);
        const ritualText = String(ritualVerse?.text ?? ritualVerse?.quote ?? '').trim();
        const ritualReference = String(ritualVerse?.reference ?? ritualRawRef ?? '').trim();

        if (ritualRef && ritualText) {
            return {
                ref: ritualRef,
                href: `/versehub/id/${ritualRef}`,
                text: ritualText,
                reference: ritualReference || ritualRawRef,
            } as FeaturedVerse;
        }

        const featuredPost =
            discussionPosts.find((p) => p.is_featured) ??
            discussionPosts.find((p) => p.type === 'verse_reflection') ??
            null;

        if (featuredPost) {
            const metadata = (featuredPost.metadata && typeof featuredPost.metadata === 'object')
                ? featuredPost.metadata
                : {};
            const postRawRef = (metadata as any).ref ?? (metadata as any).verse_ref ?? (metadata as any).reference ?? '';
            const postRef = slugifyRef(postRawRef);
            const postText = String((metadata as any).quote ?? (metadata as any).text ?? featuredPost.text ?? '').trim();
            const postReference = String((metadata as any).reference ?? postRawRef ?? '').trim();

            if (postRef && postText) {
                return {
                    ref: postRef,
                    href: `/versehub/id/${postRef}`,
                    text: postText,
                    reference: postReference || postRawRef,
                } as FeaturedVerse;
            }
        }

        return {
            ref: 'mazmur-23-1',
            href: '/versehub/id/mazmur-23-1',
            text: 'TUHAN adalah gembalaku, takkan kekurangan aku.',
            reference: 'Mazmur 23:1',
        } as FeaturedVerse;
    }, [rituals, discussionPosts]);

    const onTogglePray = (postId: number) => {
        let rollbackPost: CommunityPost | null = null;
        mutatePostEverywhere(postId, (post) => {
            rollbackPost = post;
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

        router.post(`/community/posts/${postId}/pray`, {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                if (rollbackPost) mutatePostEverywhere(postId, () => rollbackPost as CommunityPost);
            },
        });
    };

    const defaultExpanded = (groupKey: string) => groupKey === 'today' || groupKey === 'yesterday';
    const visibleStep = 4;
    const jumpOptions = archiveGroups.map((group) => ({ value: group.key, label: group.label }));

    const scrollToArchiveGroup = (groupKey: string) => {
        const target = document.getElementById(`archive-group-${groupKey}`);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setArchiveExpanded((prev) => ({ ...prev, [groupKey]: true }));
    };

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 1400);
    };

    const sharePost = async (id: number) => {
        const url = `${shareOrigin}/community/posts/${id}/share`;
        const shareTitle = 'Community Post';
        const openShareUrl = (targetUrl: string) => {
            const ua = navigator.userAgent || '';
            const isIOS = /iP(hone|od|ad)/.test(ua);
            if (isIOS) {
                window.location.assign(targetUrl);
                return;
            }
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        };

        const openWhatsApp = () => {
            const wa = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${url}`)}`;
            openShareUrl(wa);
        };

        try {
            if (navigator.share) {
                await navigator.share({ title: shareTitle, url });
                return;
            }

            openWhatsApp();
        } catch {
            try {
                openWhatsApp();
            } catch {
                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(url);
                    } else {
                        const ta = document.createElement('textarea');
                        ta.value = url;
                        ta.setAttribute('readonly', '');
                        ta.style.position = 'fixed';
                        ta.style.left = '-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        ta.remove();
                    }
                    showToast('Link copied');
                } catch {
                    showToast('Share not available');
                }
            }
        }
    };

    const mutatePostEverywhere = (postId: number, updater: (post: CommunityPost) => CommunityPost) => {
        setDiscussionPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
        setArchivedItems((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
    };


    const onToggleBookmark = (postId: number) => {
        let rollbackPost: CommunityPost | null = null;
        mutatePostEverywhere(postId, (post) => {
            rollbackPost = post;
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

        router.post(`/community/posts/${postId}/bookmark`, {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['posts', 'archivePosts', 'notifications'],
            onError: () => {
                if (rollbackPost) mutatePostEverywhere(postId, () => rollbackPost as CommunityPost);
            },
        });
    };

    const runAdminAction = async (postId: number, action: 'hide' | 'extend_24h' | 'expire_now') => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        try {
            const res = await fetch(`/community/posts/${postId}/admin-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error('failed');
            const json = await res.json();

            if (action === 'hide') {
                setDiscussionPosts((prev) => prev.filter((p) => p.id !== postId));
                setArchivedItems((prev) => prev.filter((p) => p.id !== postId));
                showToast('Post hidden');
                return;
            }

            if (action === 'expire_now') {
                setDiscussionPosts((prev) => prev.filter((p) => p.id !== postId));
                // Optionally reload archivePosts or mutate it
                showToast('Post moved to archive');
                return;
            }

            if (action === 'extend_24h') {
                const nextExpiresAt = String(json?.expires_at ?? '');
                mutatePostEverywhere(postId, (post) => ({
                    ...post,
                    metadata: {
                        ...(post.metadata ?? {}),
                        expires_at: nextExpiresAt || (post.metadata?.expires_at ?? null),
                    },
                }));
                showToast('Post extended +24h');
            }
        } catch {
            showToast('Admin action failed');
        }
    };

    const loadComments = async (postId: number) => {
        setCommentsLoading(true);
        try {
            const res = await fetch(`/community/posts/${postId}/comments`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const json = await res.json();
            const comments = Array.isArray(json?.comments) ? (json.comments as SheetComment[]) : [];
            setCommentsByPost((prev) => ({ ...prev, [postId]: comments }));
        } catch {
            setCommentsByPost((prev) => ({ ...prev, [postId]: prev[postId] ?? [] }));
        } finally {
            setCommentsLoading(false);
        }
    };

    const openComments = async (postId: number) => {
        setCommentPostId(postId);
        setReplyTarget(null);
        setCommentsOpen(true);
        await loadComments(postId);
    };

    const submitComment = async (text: string) => {
        if (!commentPostId) return;
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

        try {
            const res = await fetch(`/community/posts/${commentPostId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    body: text,
                    reply_to_comment_id: replyTarget?.id ?? null,
                }),
            });
            const json = await res.json();
            const created = json?.comment as SheetComment | undefined;
            if (created) {
                setCommentsByPost((prev) => ({
                    ...prev,
                    [commentPostId]: [created, ...(prev[commentPostId] ?? [])],
                }));
                mutatePostEverywhere(commentPostId, (post) => ({
                    ...post,
                    stats: {
                        ...post.stats,
                        comments_count: post.stats.comments_count + 1,
                    },
                }));
                setReplyTarget(null);
                showToast('Comment posted');
            }
        } catch {
            showToast('Failed to post comment');
        }
    };

    return (
        <MobileAppLayout title="Community" activeNavId="library" backHref="/today">
            <div className="mx-auto w-full max-w-[640px] space-y-4 px-1 pb-28 md:px-0">
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
                    onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                    className="space-y-6"
                >
                    <div className="sticky top-0 z-40 py-2 -mx-1 px-1">
                        <TabsList className="relative flex h-[52px] w-full items-center justify-between rounded-[20px] bg-slate-200/50 dark:bg-slate-800/50 p-1.5 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                            {['discussions', 'archive', 'bookmarks'].map((tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className={cn(
                                        "relative flex-1 h-full rounded-[14px] text-[13px] font-black uppercase tracking-widest transition-all duration-300 z-10",
                                        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-brand dark:data-[state=active]:text-white",
                                        "data-[state=active]:shadow-[0_8px_20px_rgba(0,0,0,0.12)] data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-slate-700 dark:data-[state=inactive]:hover:text-slate-200"
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

                        {discussionPosts.length ? (
                            discussionPosts.map((p, index) => (
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
                                    id={`post-${p.id}`}
                                    className="transition-all duration-500"
                                >
                                    <MemberPostCard
                                        {...postToCardProps(p, {
                                            onPray: onTogglePray,
                                            onBookmark: onToggleBookmark,
                                            onOpenComments: openComments,
                                            onShare: sharePost,
                                            onAdminHide: (id) => runAdminAction(id, 'hide'),
                                            onAdminExtend24h: (id) => runAdminAction(id, 'extend_24h'),
                                            onAdminExpireNow: (id) => runAdminAction(id, 'expire_now'),
                                        })}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <Card className="rounded-[32px] bg-surface shadow-soft border-none">
                                <CardContent className="p-12 text-center space-y-2">
                                    <p className="tct-h3 text-slate-400">Belum ada diskusi aktif.</p>
                                    <p className="text-xs text-slate-300 uppercase tracking-widest font-bold">Mulai percakapan hari ini</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="archive" className="space-y-4">
                        <div className="sticky top-[68px] z-20 -mx-4 px-4 py-2 bg-surface-muted/95 backdrop-blur-sm border-b border-black/5 dark:border-white/5 md:static md:bg-transparent md:backdrop-blur-none md:border-none md:mx-0 md:px-0">
                            <div className="relative group">
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {[
                                        { key: 'all', label: 'Semua' },
                                        { key: 'quotes', label: 'Quotes' },
                                        { key: 'reflections', label: 'Refleksi' },
                                        { key: 'prayer_requests', label: 'Doa' },
                                        { key: 'testimonies', label: 'Kesaksian' },
                                    ].map((item) => {
                                        const active = archiveCategory === (item.key as ArchiveCategory);
                                        return (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setArchiveCategory(item.key as ArchiveCategory)}
                                                className={cn(
                                                    'tct-pressable whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-all',
                                                    active
                                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-soft'
                                                        : 'bg-white/80 text-slate-500 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800',
                                                )}
                                            >
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Subtle fade effect for scrolling */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface-muted to-transparent md:hidden" />
                            </div>

                            {jumpOptions.length ? (
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="relative w-full">
                                        <select
                                            className="h-10 w-full appearance-none rounded-xl border border-black/5 bg-white px-4 text-xs font-bold text-slate-700 outline-none ring-0 shadow-sm dark:bg-slate-800 dark:text-slate-200"
                                            defaultValue=""
                                            onChange={(event) => {
                                                if (!event.target.value) return;
                                                scrollToArchiveGroup(event.target.value);
                                                event.target.value = '';
                                            }}
                                        >
                                            <option value="">Pilih Timeline...</option>
                                            {jumpOptions.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {archiveGroups.length ? (
                            archiveGroups.map((group) => (
                                <section key={group.key} id={`archive-group-${group.key}`} className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setArchiveExpanded((prev) => ({
                                                ...prev,
                                                [group.key]: !(prev[group.key] ?? defaultExpanded(group.key)),
                                            }))
                                        }
                                        className="tct-pressable flex w-full items-center justify-between rounded-2xl px-1 py-1 text-left"
                                        aria-expanded={archiveExpanded[group.key] ?? defaultExpanded(group.key)}
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {group.label}
                                        </p>
                                        <ChevronDown
                                            className={cn(
                                                'h-4 w-4 text-muted-foreground transition-transform',
                                                (archiveExpanded[group.key] ?? defaultExpanded(group.key))
                                                    ? 'rotate-180'
                                                    : '',
                                            )}
                                        />
                                    </button>

                                    {(archiveExpanded[group.key] ?? defaultExpanded(group.key)) ? (
                                        <div className="space-y-3">
                                            {group.items
                                                .slice(0, archiveVisibleCount[group.key] ?? visibleStep)
                                                .map((p) => (
                                                    <div key={p.id} id={`post-${p.id}`}>
                                                        <MemberPostCard
                                                            {...postToCardProps(p, {
                                                                onPray: onTogglePray,
                                                                onBookmark: onToggleBookmark,
                                                                onOpenComments: openComments,
                                                                onShare: sharePost,
                                                                onAdminHide: (id) => runAdminAction(id, 'hide'),
                                                                onAdminExtend24h: (id) => runAdminAction(id, 'extend_24h'),
                                                                onAdminExpireNow: (id) => runAdminAction(id, 'expire_now'),
                                                            })}
                                                            compact
                                                            className={cn('opacity-[0.96]')}
                                                        />
                                                    </div>
                                                ))}

                                            {(archiveVisibleCount[group.key] ?? visibleStep) < group.items.length ? (
                                                <div className="flex justify-center pt-1">
                                                    <button
                                                        type="button"
                                                        className="tct-pressable rounded-full bg-surface-muted px-4 py-2 text-xs font-medium text-muted-foreground"
                                                        onClick={() =>
                                                            setArchiveVisibleCount((prev) => ({
                                                                ...prev,
                                                                [group.key]: (prev[group.key] ?? visibleStep) + visibleStep,
                                                            }))
                                                        }
                                                    >
                                                        Lihat lebih banyak
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </section>
                            ))
                        ) : (
                            <Card className="rounded-3xl bg-surface shadow-soft">
                                <CardContent className="p-6">
                                    <p className="tct-meta">Belum ada arsip post.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="bookmarks">
                        <Card className="rounded-3xl bg-surface shadow-soft">
                            <CardContent className="p-6">
                                <p className="tct-meta">Belum ada post tersimpan.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <CommentsSheet
                open={commentsOpen}
                onClose={() => {
                    setCommentsOpen(false);
                    setReplyTarget(null);
                }}
                comments={commentPostId ? (commentsByPost[commentPostId] ?? []) : []}
                title={commentsLoading ? 'Comments (loading...)' : 'Comments'}
                onReply={(comment) => setReplyTarget(comment)}
                replyingToAuthor={replyTarget?.author ?? null}
                onCancelReply={() => setReplyTarget(null)}
                onSubmit={submitComment}
            />

            {toast ? (
                <div className="fixed left-1/2 top-6 z-[80] -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white ring-1 ring-white/10 backdrop-blur">
                    {toast}
                </div>
            ) : null}
        </MobileAppLayout>
    );
}
