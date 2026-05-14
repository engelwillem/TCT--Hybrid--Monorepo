import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { cn } from '@/lib/utils';
import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, X } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { linkifyBibleRefs } from '@/lib/versehub-linkify';

function looksLikeHtml(s: string) {
    return /<\/?[a-z][\s\S]*>/i.test(s);
}

function escapeHtml(s: string) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function plainTextToHtml(s: string) {
    const blocks = s.split(/\n{2,}/g).map((b) => b.trim()).filter(Boolean);
    return blocks
        .map((b) => `<p>${escapeHtml(b).replace(/\n/g, '<br />')}</p>`)
        .join('');
}

function toReaderHtml(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return '';
    return looksLikeHtml(trimmed) ? trimmed : plainTextToHtml(trimmed);
}

async function copyText(text: string) {
    // Clipboard API requires secure context (https). Provide a fallback.
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
}

type Quarter = {
    year: number;
    quarter: number;
};

type Lesson = {
    lesson_number: number;
};

type Day = {
    day_key: string;
    date: string;
    title?: string | null;
    content?: string | null;
    media_links?: unknown[] | null;
    cover_image_url?: string | null;
    status: string;
};

type SheetComment = {
    id: string | number;
    author: string;
    body: string;
    created_at?: string | null;
    reply_to_id?: string | number | null;
    reply_to_author?: string | null;
    can_delete?: boolean;
    can_edit?: boolean;
};

type HeroMedia = {
    kind: 'image' | 'embed' | 'external';
    src: string;
    provider: 'youtube' | 'instagram' | 'tiktok' | 'canva' | 'unknown';
};

type CommentNode = {
    comment: SheetComment;
    children: CommentNode[];
};

const dayLabel: Record<string, string> = {
    sat: 'Saturday',
    sun: 'Sunday',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
};

function parseHeroMediaEntry(raw: unknown, fallbackImage: string): HeroMedia {
    const entry =
        typeof raw === 'string'
            ? { url: raw }
            : raw && typeof raw === 'object'
              ? (raw as Record<string, unknown>)
              : null;
    const url = String(entry?.url ?? '').trim();
    if (!url) return { kind: 'image', src: fallbackImage, provider: 'unknown' };

    const host = (() => {
        try {
            return new URL(url).hostname.toLowerCase();
        } catch {
            return '';
        }
    })();

    if (/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url)) {
        return { kind: 'image', src: url, provider: 'unknown' };
    }

    if (host.includes('youtu.be') || host.includes('youtube.com')) {
        let id = '';
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtu.be')) id = u.pathname.replace('/', '');
            else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2] ?? '';
            else id = u.searchParams.get('v') ?? '';
        } catch {
            id = '';
        }
        if (id) return { kind: 'embed', src: `https://www.youtube.com/embed/${id}`, provider: 'youtube' };
    }

    if (host.includes('canva.com')) return { kind: 'embed', src: url, provider: 'canva' };
    if (host.includes('instagram.com')) return { kind: 'external', src: url, provider: 'instagram' };
    if (host.includes('tiktok.com')) return { kind: 'external', src: url, provider: 'tiktok' };
    return { kind: 'external', src: url, provider: 'unknown' };
}

function parseHeroMedias(mediaLinks: unknown[] | null | undefined, fallbackImage: string): HeroMedia[] {
    if (!Array.isArray(mediaLinks) || mediaLinks.length === 0) {
        return [{ kind: 'image', src: fallbackImage, provider: 'unknown' }];
    }
    const parsed = mediaLinks
        .map((raw) => parseHeroMediaEntry(raw, fallbackImage))
        .filter((item) => Boolean(item.src));
    return parsed.length ? parsed : [{ kind: 'image', src: fallbackImage, provider: 'unknown' }];
}

export default function DayShow({
    quarter,
    lesson,
    day,
    days,
}: {
    quarter: Quarter;
    lesson: Lesson;
    day: Day;
    days?: Day[];
}) {
    const page = usePage();
    const authUser = (page.props as any)?.auth?.user ?? null;
    const isAdmin = Boolean((authUser as any)?.is_admin);
    const uiAssets = (page.props as any)?.ui?.assets ?? {};

    // Back arrow should return to the upgraded index page.
    const backHref = `/channels/sabbath-school`;

    const [toastText, setToastText] = useState<string | null>(null);
    useEffect(() => {
        if (!toastText) return;
        const t = window.setTimeout(() => setToastText(null), 1600);
        return () => window.clearTimeout(t);
    }, [toastText]);

    const STORAGE_KEY = 'tct:ss:last_reading';
    useEffect(() => {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    year: quarter.year,
                    quarter: quarter.quarter,
                    lesson_number: lesson.lesson_number,
                    day_key: day.day_key,
                    date: day.date,
                }),
            );
        } catch {
            // ignore
        }
    }, [quarter.year, quarter.quarter, lesson.lesson_number, day.day_key, day.date]);

    const orderedDayKeys = useMemo(() => ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'], []);

    // Current day comes from server props (fast initial load; no need to ship all day contents).
    const activeDayKey = day.day_key;
    const [transitioning, setTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [animX, setAnimX] = useState(0);
    // reserved for future (e.g. directional easing)
    // const lastDir = useRef<-1 | 1>(1);

    const availableDayKeys = useMemo(() => {
        const set = new Set<string>();
        (days ?? []).forEach((d) => set.add(d.day_key));
        set.add(day.day_key);
        return set;
    }, [days, day.day_key]);

    const activeDay = day;

    // Share/link target (canonical for the current day)
    const dayUrl = useMemo(() => {
        return `/channels/sabbath-school/${quarter.year}/q${quarter.quarter}/lesson/${lesson.lesson_number}/${activeDayKey}`;
    }, [quarter.year, quarter.quarter, lesson.lesson_number, activeDayKey]);

    // Like / Bookmark persistence (local only)
    const reactionKey = useMemo(() => {
        return `tct:ss:reactions:${quarter.year}:q${quarter.quarter}:lesson:${lesson.lesson_number}:day:${activeDayKey}`;
    }, [quarter.year, quarter.quarter, lesson.lesson_number, activeDayKey]);

    const reactionsLoadedKey = useRef<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const [likeBase, setLikeBase] = useState<number>(0);
    const [bookmarkBase, setBookmarkBase] = useState<number>(0);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(reactionKey);
            const parsed = raw
                ? (JSON.parse(raw) as {
                      liked?: boolean;
                      bookmarked?: boolean;
                      like_base?: number;
                      bookmark_base?: number;
                  })
                : null;
            setLiked(Boolean(parsed?.liked));
            setBookmarked(Boolean(parsed?.bookmarked));

            setLikeBase(typeof parsed?.like_base === 'number' ? parsed.like_base : 0);
            setBookmarkBase(typeof parsed?.bookmark_base === 'number' ? parsed.bookmark_base : 0);

            reactionsLoadedKey.current = reactionKey;
        } catch {
            setLikeBase(0);
            setBookmarkBase(0);
            reactionsLoadedKey.current = reactionKey;
        }
    }, [reactionKey]);

    useEffect(() => {
        if (reactionsLoadedKey.current !== reactionKey) return;
        try {
            window.localStorage.setItem(
                reactionKey,
                JSON.stringify({
                    liked,
                    bookmarked,
                    like_base: likeBase,
                    bookmark_base: bookmarkBase,
                    updated_at: new Date().toISOString(),
                }),
            );
        } catch {
            // ignore
        }
    }, [reactionKey, liked, bookmarked, likeBase, bookmarkBase]);

    const likeLabel = liked ? `You + ${likeBase}` : String(likeBase);
    const bookmarkLabel = bookmarked ? `You + ${bookmarkBase}` : String(bookmarkBase);

    const coverFallback =
        uiAssets?.sabbathCoverFallback ||
        'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop';

    // Header image per day (placeholder; later source from DB/content metadata)
    const dayCovers: Record<string, string> = {
        sat: uiAssets?.sabbathCoversByDay?.sat || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop',
        sun: uiAssets?.sabbathCoversByDay?.sun || 'https://images.unsplash.com/photo-1455885666463-5ad9996b2d45?q=80&w=1200&auto=format&fit=crop',
        mon: uiAssets?.sabbathCoversByDay?.mon || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop',
        tue: uiAssets?.sabbathCoversByDay?.tue || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1200&auto=format&fit=crop',
        wed: uiAssets?.sabbathCoversByDay?.wed || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
        thu: uiAssets?.sabbathCoversByDay?.thu || 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1200&auto=format&fit=crop',
        fri: uiAssets?.sabbathCoversByDay?.fri || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    };

    const coverSrc = activeDay.cover_image_url?.trim() || dayCovers[activeDayKey] || coverFallback;
    const heroMedias = useMemo(() => parseHeroMedias(activeDay.media_links, coverSrc), [activeDay.media_links, coverSrc]);
    const [activeMediaIdx, setActiveMediaIdx] = useState(0);
    const [fullscreenOpen, setFullscreenOpen] = useState(false);
    const [showMediaNav, setShowMediaNav] = useState(true);
    const [fullscreenScale, setFullscreenScale] = useState(1);
    const [isPinching, setIsPinching] = useState(false);
    const hideMediaNavTimerRef = useRef<number | null>(null);
    const pinchStartDistanceRef = useRef<number | null>(null);
    const pinchStartScaleRef = useRef(1);
    const lastTapAtRef = useRef<number>(0);
    const activeMedia = heroMedias[Math.min(activeMediaIdx, Math.max(heroMedias.length - 1, 0))] ?? heroMedias[0];

    const [sheetVerseHref, setSheetVerseHref] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [adminSaving, setAdminSaving] = useState(false);
    const [adminCreating, setAdminCreating] = useState(false);
    const [adminDeleting, setAdminDeleting] = useState(false);
    const [adminDayKey, setAdminDayKey] = useState(activeDay.day_key);
    const [adminDate, setAdminDate] = useState(String(activeDay.date || '').slice(0, 10));
    const [adminTitle, setAdminTitle] = useState(activeDay.title ?? '');
    const [adminContent, setAdminContent] = useState(activeDay.content ?? '');
    const [adminStatus, setAdminStatus] = useState<'draft' | 'published'>((activeDay.status === 'published' ? 'published' : 'draft'));
    const [adminCoverImageUrl, setAdminCoverImageUrl] = useState(activeDay.cover_image_url ?? '');
    const [adminMediaLinksText, setAdminMediaLinksText] = useState('');
    const [newDayKey, setNewDayKey] = useState('sat');
    const [newDate, setNewDate] = useState('');
    const [newTitle, setNewTitle] = useState('');

    const adminBaseUrl = useMemo(
        () => `/channels/sabbath-school/${quarter.year}/q${quarter.quarter}/lesson/${lesson.lesson_number}`,
        [quarter.year, quarter.quarter, lesson.lesson_number],
    );
    const adminUpdateUrl = useMemo(
        () => `${adminBaseUrl}/${activeDayKey}/admin`,
        [adminBaseUrl, activeDayKey],
    );
    const adminCreateUrl = useMemo(
        () => `${adminBaseUrl}/admin/days`,
        [adminBaseUrl],
    );

    // Discussion comments
    const [replyTarget, setReplyTarget] = useState<SheetComment | null>(null);
    const [comments, setComments] = useState<SheetComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [guestAuthorName, setGuestAuthorName] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');


    const commentsUrl = useMemo(
        () =>
            `/channels/sabbath-school/${quarter.year}/q${quarter.quarter}/lesson/${lesson.lesson_number}/${activeDayKey}/comments`,
        [quarter.year, quarter.quarter, lesson.lesson_number, activeDayKey],
    );
    const commentDeleteUrl = (commentId: string | number) => `${commentsUrl}/${encodeURIComponent(String(commentId))}`;
    const commentUpdateUrl = (commentId: string | number) => `${commentsUrl}/${encodeURIComponent(String(commentId))}`;

    const loadComments = async () => {
        setCommentsLoading(true);
        try {
            const res = await fetch(commentsUrl, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!res.ok) throw new Error('failed');
            const json = await res.json();
            const list = Array.isArray(json?.comments) ? (json.comments as SheetComment[]) : [];
            setComments(list);
        } catch {
            setComments([]);
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        void loadComments();
    }, [commentsUrl]);

    useEffect(() => {
        if (authUser) return;
        try {
            const saved = window.localStorage.getItem('tct:ss:guest_name') || '';
            setGuestAuthorName(saved);
        } catch {
            // ignore
        }
    }, [authUser]);

    useEffect(() => {
        if (authUser) return;
        try {
            window.localStorage.setItem('tct:ss:guest_name', guestAuthorName);
        } catch {
            // ignore
        }
    }, [authUser, guestAuthorName]);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const mediaTouchStartX = useRef<number | null>(null);
    const mediaTouchStartY = useRef<number | null>(null);

    const setDay = (nextKey: string, dir?: -1 | 1) => {
        if (nextKey === activeDayKey) return;
        if (!orderedDayKeys.includes(nextKey)) return;
        if (!availableDayKeys.has(nextKey)) return;

        const currentIdx = orderedDayKeys.indexOf(activeDayKey);
        const nextIdx = orderedDayKeys.indexOf(nextKey);
        const computedDir: -1 | 1 = dir ?? (nextIdx > currentIdx ? 1 : -1);

        // Smooth transition (slide + skeleton) while we fetch next day's content.
        setIsLoading(true);
        setTransitioning(true);
        setAnimX(-computedDir * 18);

        const href = `/channels/sabbath-school/${quarter.year}/q${quarter.quarter}/lesson/${lesson.lesson_number}/${nextKey}`;

        router.visit(href, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onFinish: () => {
                // New props have arrived.
                setAnimX(0);
                setTransitioning(false);
                setIsLoading(false);
            },
        });
    };

    const goPrevNext = (dir: -1 | 1) => {
        const idx = orderedDayKeys.indexOf(activeDayKey);
        if (idx === -1) return;
        const next = orderedDayKeys[idx + dir];
        if (next) setDay(next, dir);
    };

    useEffect(() => {
        setActiveMediaIdx(0);
        setFullscreenOpen(false);
        setFullscreenScale(1);
    }, [activeDayKey]);

    useEffect(() => {
        const urls = Array.isArray(activeDay.media_links)
            ? activeDay.media_links
                .map((entry) => {
                    if (typeof entry === 'string') return entry.trim();
                    if (entry && typeof entry === 'object') return String((entry as any).url ?? '').trim();
                    return '';
                })
                .filter(Boolean)
            : [];

        setAdminDayKey(activeDay.day_key);
        setAdminDate(String(activeDay.date || '').slice(0, 10));
        setAdminTitle(activeDay.title ?? '');
        setAdminContent(activeDay.content ?? '');
        setAdminStatus(activeDay.status === 'published' ? 'published' : 'draft');
        setAdminCoverImageUrl(activeDay.cover_image_url ?? '');
        setAdminMediaLinksText(urls.join('\n'));
    }, [activeDay]);

    const parseMediaLinksText = (value: string) =>
        value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((url) => ({ url }));

    const bumpMediaNavVisibility = () => {
        if (heroMedias.length <= 1) return;
        setShowMediaNav(true);
        if (hideMediaNavTimerRef.current) {
            window.clearTimeout(hideMediaNavTimerRef.current);
        }
        hideMediaNavTimerRef.current = window.setTimeout(() => setShowMediaNav(false), 2000);
    };

    useEffect(() => {
        bumpMediaNavVisibility();
        return () => {
            if (hideMediaNavTimerRef.current) {
                window.clearTimeout(hideMediaNavTimerRef.current);
                hideMediaNavTimerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullscreenOpen, activeMediaIdx, heroMedias.length]);

    const moveMedia = (dir: -1 | 1) => {
        setActiveMediaIdx((prev) => {
            if (!heroMedias.length) return 0;
            const next = (prev + dir + heroMedias.length) % heroMedias.length;
            return next;
        });
        setFullscreenScale(1);
        bumpMediaNavVisibility();
    };

    const renderedContentHtml = useMemo(() => {
        const content = activeDay.content ?? '';
        if (!content.trim()) return '';
        return linkifyBibleRefs(toReaderHtml(content));
    }, [activeDay.content]);

    const formatFullDateId = (iso: string) => {
        try {
            const d = new Date(iso);
            return new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }).format(d);
        } catch {
            return iso;
        }
    };

    const submitComment = async (text: string) => {
        const normalized = text.trim();
        if (!normalized) return;
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const rawReplyId = replyTarget?.id;
        const replyToId =
            typeof rawReplyId === 'number'
                ? rawReplyId
                : rawReplyId && /^\d+$/.test(String(rawReplyId))
                  ? Number(rawReplyId)
                  : null;

        const xsrfCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        const xsrfToken = xsrfCookie ? decodeURIComponent(xsrfCookie) : '';
        try {
            const res = await fetch(commentsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf,
                    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    body: normalized,
                    reply_to_id: replyToId,
                    author_name: authUser ? undefined : guestAuthorName.trim(),
                }),
            });
            if (!res.ok) throw new Error('failed');
            const json = await res.json();
            const created = json?.comment as SheetComment | undefined;
            if (created) await loadComments();
        } catch {
            setToastText('Gagal mengirim komentar');
        }
        setCommentText('');
        setReplyTarget(null);
    };

    const saveAdminDay = () => {
        if (!isAdmin) return;
        setAdminSaving(true);
        router.patch(adminUpdateUrl, {
            day_key: adminDayKey,
            date: adminDate,
            title: adminTitle.trim(),
            content: adminContent,
            status: adminStatus,
            cover_image_url: adminCoverImageUrl.trim(),
            media_links: parseMediaLinksText(adminMediaLinksText),
        }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setToastText('Materi berhasil diperbarui');
                setAdminSaving(false);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                setToastText(typeof firstError === 'string' ? firstError : 'Gagal update materi');
                setAdminSaving(false);
            }
        });
    };

    const createAdminDay = () => {
        if (!isAdmin) return;
        if (!newDayKey || !newDate) {
            setToastText('Day key dan tanggal wajib diisi');
            return;
        }
        setAdminCreating(true);
        router.post(adminCreateUrl, {
            day_key: newDayKey,
            date: newDate,
            title: newTitle.trim(),
            content: '',
            status: 'draft',
            cover_image_url: '',
            media_links: [],
        }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setToastText('Hari baru berhasil dibuat');
                setAdminCreating(false);
                setNewTitle('');
                setAdminPanelOpen(false); // Close panel after creation if desired
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                setToastText(typeof firstError === 'string' ? firstError : 'Gagal membuat hari baru');
                setAdminCreating(false);
            }
        });
    };

    const deleteAdminDay = () => {
        if (!isAdmin) return;
        const yes = window.confirm('Hapus hari pelajaran ini? Tindakan ini tidak dapat dibatalkan.');
        if (!yes) return;
        setAdminDeleting(true);
        router.delete(adminUpdateUrl, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setToastText('Hari pelajaran berhasil dihapus');
                setAdminDeleting(false);
            },
            onError: () => {
                setToastText('Gagal menghapus hari');
                setAdminDeleting(false);
            }
        });
    };

    const discussionComments = useMemo(() => comments, [comments]);
    const threadedComments = useMemo(() => {
        const nodes = new Map<string, CommentNode>();
        const roots: CommentNode[] = [];

        discussionComments.forEach((comment) => {
            nodes.set(String(comment.id), { comment, children: [] });
        });

        discussionComments.forEach((comment) => {
            const node = nodes.get(String(comment.id));
            if (!node) return;
            const parentId = comment.reply_to_id == null ? null : String(comment.reply_to_id);
            if (!parentId) {
                roots.push(node);
                return;
            }
            const parentNode = nodes.get(parentId);
            if (!parentNode) {
                roots.push(node);
                return;
            }
            parentNode.children.push(node);
        });

        return roots;
    }, [discussionComments]);

    const renderCommentNode = (node: CommentNode, depth = 0) => {
        const c = node.comment;
        const canReply = /^\d+$/.test(String(c.id));
        const canDelete = Boolean(c.can_delete);
        const canEdit = Boolean(c.can_edit);
        const isEditing = editingCommentId != null && String(editingCommentId) === String(c.id);
        return (
            <article key={c.id} className={cn('rounded-2xl bg-surface px-4 py-3 ring-1 ring-black/5', depth > 0 ? 'bg-surface-muted/80' : '')}>
                <div className="flex items-center justify-between gap-3">
                    <p className={cn('font-semibold', depth > 0 ? 'text-[12px]' : 'text-[13px]')}>{c.author}</p>
                    <div className="flex items-center gap-3">
                        {canEdit ? (
                            <button
                                type="button"
                                className={cn('font-semibold text-foreground', depth > 0 ? 'text-[11px]' : 'text-[12px]')}
                                onClick={() => {
                                    setEditingCommentId(c.id);
                                    setEditingCommentText(c.body ?? '');
                                }}
                            >
                                Edit
                            </button>
                        ) : null}
                        {canDelete ? (
                            <button
                                type="button"
                                className={cn('font-semibold text-rose-500', depth > 0 ? 'text-[11px]' : 'text-[12px]')}
                                onClick={async () => {
                                    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                    try {
                                        const res = await fetch(commentDeleteUrl(c.id), {
                                            method: 'DELETE',
                                            headers: {
                                                Accept: 'application/json',
                                                'X-CSRF-TOKEN': csrf,
                                            },
                                            credentials: 'same-origin',
                                        });
                                        if (!res.ok) throw new Error('failed');
                                        await loadComments();
                                        if (replyTarget && String(replyTarget.id) === String(c.id)) {
                                            setReplyTarget(null);
                                        }
                                        setToastText('Komentar dihapus');
                                    } catch {
                                        setToastText('Gagal menghapus komentar');
                                    }
                                }}
                            >
                                Hapus
                            </button>
                        ) : null}
                        {canReply ? (
                            <button
                                type="button"
                                className={cn('font-semibold text-brand', depth > 0 ? 'text-[11px]' : 'text-[12px]')}
                                onClick={() => setReplyTarget(c)}
                            >
                                Reply
                            </button>
                        ) : null}
                    </div>
                </div>
                {c.reply_to_author && depth > 0 ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">Membalas {c.reply_to_author}</p>
                ) : null}
                {isEditing ? (
                    <div className="mt-2 rounded-xl bg-background p-2 ring-1 ring-black/10">
                        <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="min-h-[90px] w-full resize-y rounded-lg border border-border/70 bg-surface px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-foreground/30"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                className="rounded-full bg-surface-muted px-3 py-1.5 text-[11px] font-semibold"
                                onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentText('');
                                }}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="rounded-full bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background"
                                onClick={async () => {
                                    const normalized = editingCommentText.trim();
                                    if (!normalized) {
                                        setToastText('Komentar tidak boleh kosong');
                                        return;
                                    }
                                    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                    try {
                                        const res = await fetch(commentUpdateUrl(c.id), {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Accept: 'application/json',
                                                'X-CSRF-TOKEN': csrf,
                                            },
                                            credentials: 'same-origin',
                                            body: JSON.stringify({ body: normalized }),
                                        });
                                        if (!res.ok) throw new Error('failed');
                                        await loadComments();
                                        setEditingCommentId(null);
                                        setEditingCommentText('');
                                        setToastText('Komentar diperbarui');
                                    } catch {
                                        setToastText('Gagal memperbarui komentar');
                                    }
                                }}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className={cn('mt-1 leading-relaxed text-foreground/90', depth > 0 ? 'text-[13px]' : 'text-[14px]')}>{c.body}</p>
                )}
                {c.created_at ? <p className="mt-1 text-[11px] text-muted-foreground">{c.created_at}</p> : null}

                {node.children.length ? (
                    <div className={cn('mt-3 space-y-2 border-l border-border/80 pl-3', depth > 0 ? 'ml-1' : '')}>
                        {node.children.map((child) => renderCommentNode(child, depth + 1))}
                    </div>
                ) : null}
            </article>
        );
    };

    return (
        <MobileAppLayout
            title={dayLabel[day.day_key] ?? day.day_key}
            activeNavId="channels"
            backHref={backHref}
            density="reader"
        >
            {/* Toast */}
            {toastText ? (
                <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white ring-1 ring-white/10 backdrop-blur">
                    {toastText}
                </div>
            ) : null}

            {/* VerseHub bottom sheet (preview) */}
            {sheetOpen && sheetVerseHref ? (
                <div
                    className="fixed inset-0 z-50"
                    role="dialog"
                    aria-modal="true"
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        aria-label="Close"
                        onClick={() => setSheetOpen(false)}
                    />
                    <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden rounded-t-3xl bg-surface shadow-card">
                        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                            <div className="h-1.5 w-10 rounded-full bg-border/70" />
                            <a
                                href={sheetVerseHref}
                                className="text-[13px] font-semibold text-brand"
                            >
                                Open VerseHub
                            </a>
                        </div>
                        <iframe
                            title="VerseHub"
                            src={sheetVerseHref}
                            className="h-[76vh] w-full"
                        />
                    </div>
                </div>
            ) : null}

            {/* Fullscreen media modal */}
            {fullscreenOpen ? (
                <div className="fixed inset-0 z-[70] bg-black/85" role="dialog" aria-modal="true">
                    <button
                        type="button"
                        className="absolute right-4 top-4 z-[72] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
                        aria-label="Close preview"
                        onClick={() => setFullscreenOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Desktop side accessories */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-black/55 via-black/20 to-transparent md:block" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-black/55 via-black/20 to-transparent md:block" />

                    <div
                        className="absolute inset-0 flex items-center justify-center px-3 py-4 md:px-8"
                        onMouseMove={bumpMediaNavVisibility}
                        onTouchStart={bumpMediaNavVisibility}
                    >
                        <div className="relative h-full max-h-[96vh] w-full max-w-[56vh] md:max-w-[60vh]">
                            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/15">
                                {activeMedia.kind === 'image' ? (
                                    <div
                                        className="h-full w-full touch-none"
                                        onTouchStart={(e) => {
                                            if (e.touches.length !== 2) return;
                                            const t1 = e.touches[0];
                                            const t2 = e.touches[1];
                                            const dx = t2.clientX - t1.clientX;
                                            const dy = t2.clientY - t1.clientY;
                                            pinchStartDistanceRef.current = Math.hypot(dx, dy);
                                            pinchStartScaleRef.current = fullscreenScale;
                                            setIsPinching(true);
                                        }}
                                        onTouchMove={(e) => {
                                            if (e.touches.length !== 2) return;
                                            const start = pinchStartDistanceRef.current;
                                            if (!start) return;
                                            const t1 = e.touches[0];
                                            const t2 = e.touches[1];
                                            const dx = t2.clientX - t1.clientX;
                                            const dy = t2.clientY - t1.clientY;
                                            const currentDist = Math.hypot(dx, dy);
                                            const nextScale = Math.min(3, Math.max(1, (currentDist / start) * pinchStartScaleRef.current));
                                            setFullscreenScale(nextScale);
                                            if (nextScale !== 1) e.preventDefault();
                                        }}
                                        onTouchEnd={() => {
                                            if (!isPinching) {
                                                const now = Date.now();
                                                if (now - lastTapAtRef.current < 300) {
                                                    setFullscreenScale((prev) => (prev > 1 ? 1 : 2));
                                                    lastTapAtRef.current = 0;
                                                } else {
                                                    lastTapAtRef.current = now;
                                                }
                                            }
                                            setIsPinching(false);
                                            pinchStartDistanceRef.current = null;
                                        }}
                                        onDoubleClick={() => setFullscreenScale((prev) => (prev > 1 ? 1 : 2))}
                                    >
                                        <img
                                            src={activeMedia.src}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                            style={{
                                                transform: `scale(${fullscreenScale})`,
                                                transformOrigin: 'center center',
                                                transition: isPinching ? 'none' : 'transform 160ms ease-out',
                                            }}
                                        />
                                    </div>
                                ) : activeMedia.kind === 'embed' ? (
                                    <iframe
                                        src={activeMedia.src}
                                        title="Lesson media fullscreen"
                                        className="h-full w-full"
                                        allow="autoplay; encrypted-media; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-white/60">External Media</p>
                                            <p className="mt-3 text-xl font-semibold leading-snug">{activeDay.title ?? 'Lesson media'}</p>
                                        </div>
                                        <a
                                            href={activeMedia.src}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25"
                                        >
                                            Open source
                                        </a>
                                    </div>
                                )}
                            </div>

                            {heroMedias.length > 1 ? (
                                <>
                                    <button
                                        type="button"
                                        className={cn(
                                            'absolute left-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur transition-all duration-300',
                                            showMediaNav ? 'opacity-100' : 'pointer-events-none opacity-0',
                                        )}
                                        onClick={() => moveMedia(-1)}
                                        aria-label="Previous media"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className={cn(
                                            'absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur transition-all duration-300',
                                            showMediaNav ? 'opacity-100' : 'pointer-events-none opacity-0',
                                        )}
                                        onClick={() => moveMedia(1)}
                                        aria-label="Next media"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            <div
                className="relative"
                onClick={(e) => {
                    const t = e.target;
                    if (!(t instanceof Element)) return;
                    const a = t.closest('a[data-versehub="1"]') as HTMLAnchorElement | null;
                    if (!a) return;
                    // Open bottom sheet preview instead of full navigation (native feel).
                    e.preventDefault();
                    setSheetVerseHref(a.getAttribute('href'));
                    setSheetOpen(true);
                }}
                onTouchStart={(e) => {
                    touchStartX.current = e.touches?.[0]?.clientX ?? null;
                    touchStartY.current = e.touches?.[0]?.clientY ?? null;
                }}
                onTouchEnd={(e) => {
                    const startX = touchStartX.current;
                    const startY = touchStartY.current;
                    const endX = e.changedTouches?.[0]?.clientX ?? null;
                    const endY = e.changedTouches?.[0]?.clientY ?? null;
                    if (startX == null || endX == null || startY == null || endY == null) return;

                    const dx = endX - startX;
                    const dy = endY - startY;

                    // Ignore mostly-vertical swipes (scroll)
                    if (Math.abs(dy) > Math.abs(dx)) return;
                    if (Math.abs(dx) < 44) return;

                    if (dx < 0) goPrevNext(1);
                    else goPrevNext(-1);
                }}
            >
                <div className="space-y-5 bg-surface px-4 pb-6 pt-4">
                    {/* Hero card: media 9:16 + action bar + date + title */}
                    <section
                        className={cn(
                            'rounded-3xl bg-surface-muted p-3 shadow-soft transition-all duration-200 will-change-transform',
                            transitioning ? 'opacity-70' : 'opacity-100',
                        )}
                        style={{ transform: `translateX(${animX}px)` }}
                    >
                        <div className="overflow-hidden rounded-2xl bg-surface">
                            <div
                                className="relative mx-auto w-full max-w-[360px] md:max-w-[620px] lg:max-w-[760px]"
                                onMouseMove={bumpMediaNavVisibility}
                                onTouchStart={bumpMediaNavVisibility}
                            >
                                <button
                                    type="button"
                                    className="relative block w-full"
                                    onClick={() => setFullscreenOpen(true)}
                                    aria-label="Open media fullscreen"
                                    onTouchStart={(e) => {
                                        mediaTouchStartX.current = e.touches?.[0]?.clientX ?? null;
                                        mediaTouchStartY.current = e.touches?.[0]?.clientY ?? null;
                                    }}
                                    onTouchEnd={(e) => {
                                        const startX = mediaTouchStartX.current;
                                        const startY = mediaTouchStartY.current;
                                        const endX = e.changedTouches?.[0]?.clientX ?? null;
                                        const endY = e.changedTouches?.[0]?.clientY ?? null;
                                        if (startX == null || startY == null || endX == null || endY == null) {
                                            return;
                                        }
                                        const dx = endX - startX;
                                        const dy = endY - startY;
                                        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                                            if (dx < 0) moveMedia(1);
                                            else moveMedia(-1);
                                        }
                                    }}
                                >
                                    {activeMedia.kind === 'image' ? (
                                        <div className="aspect-[9/16] w-full max-h-[62vh] overflow-hidden rounded-2xl bg-surface-muted md:max-h-none">
                                            <img
                                                src={activeMedia.src}
                                                alt="Cover"
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    ) : activeMedia.kind === 'embed' ? (
                                        <div className="aspect-[9/16] w-full max-h-[62vh] overflow-hidden rounded-2xl bg-black/10 md:max-h-none">
                                            <iframe
                                                src={activeMedia.src}
                                                title="Lesson media"
                                                className="h-full w-full"
                                                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-[9/16] w-full max-h-[62vh] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-left text-white md:max-h-none">
                                            <p className="text-xs uppercase tracking-[0.18em] text-white/60">External Media</p>
                                            <p className="mt-2 text-lg font-semibold leading-snug">{activeDay.title ?? 'Lesson media'}</p>
                                            <p className="mt-2 text-sm text-white/75">Tap untuk fullscreen preview</p>
                                        </div>
                                    )}
                                </button>

                                {heroMedias.length > 1 ? (
                                    <>
                                        <button
                                            type="button"
                                            className={cn(
                                                'absolute left-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur transition-all duration-300',
                                                showMediaNav ? 'opacity-100' : 'pointer-events-none opacity-0',
                                            )}
                                            onClick={() => moveMedia(-1)}
                                            aria-label="Previous slide"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className={cn(
                                                'absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/20 backdrop-blur transition-all duration-300',
                                                showMediaNav ? 'opacity-100' : 'pointer-events-none opacity-0',
                                            )}
                                            onClick={() => moveMedia(1)}
                                            aria-label="Next slide"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : null}
                            </div>

                            {heroMedias.length > 1 ? (
                                <div className="mx-auto mt-3 w-full max-w-[360px] md:max-w-[620px] lg:max-w-[760px]">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {heroMedias.map((_, idx) => (
                                            <button
                                                key={`dot-${idx}`}
                                                type="button"
                                                aria-label={`Go to slide ${idx + 1}`}
                                                onClick={() => {
                                                    setActiveMediaIdx(idx);
                                                    setFullscreenScale(1);
                                                    bumpMediaNavVisibility();
                                                }}
                                                className={cn(
                                                    'h-1.5 rounded-full transition-all duration-250',
                                                    idx === activeMediaIdx
                                                        ? 'w-6 bg-foreground'
                                                        : 'w-2.5 bg-foreground/25 hover:bg-foreground/40',
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-1 text-center text-[11px] text-muted-foreground">
                                        {activeMediaIdx + 1} / {heroMedias.length}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <button
                                type="button"
                                className={cn(
                                    'tct-pressable inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px]',
                                    liked ? 'text-rose-500' : 'text-muted-foreground',
                                )}
                                onClick={() => setLiked((v) => !v)}
                            >
                                <Heart className={cn('h-5 w-5', liked ? 'fill-rose-500 text-rose-500' : '')} />
                                <span>{likeLabel}</span>
                            </button>

                            <button
                                type="button"
                                className="tct-pressable inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] text-muted-foreground"
                                onClick={async () => {
                                    const url = new URL(dayUrl, window.location.origin).toString();
                                    const shareTitle = `${activeDay.title ?? dayLabel[activeDayKey] ?? activeDayKey} • Sabbath School`;
                                    const openShareUrl = (targetUrl: string) => {
                                        const ua = navigator.userAgent || '';
                                        const isIOS = /iP(hone|od|ad)/.test(ua);
                                        if (isIOS) {
                                            window.location.assign(targetUrl);
                                            return;
                                        }
                                        window.open(targetUrl, '_blank', 'noopener,noreferrer');
                                    };
                                    const wa = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${url}`)}`;
                                    try {
                                        if (navigator.share) await navigator.share({ title: shareTitle, url });
                                        else openShareUrl(wa);
                                    } catch {
                                        try {
                                            openShareUrl(wa);
                                        } catch {
                                            try {
                                                await copyText(url);
                                                setToastText('Link copied');
                                            } catch {
                                                setToastText('Unable to share');
                                            }
                                        }
                                    }
                                }}
                            >
                                <Send className="h-5 w-5" />
                                <span>Share</span>
                            </button>

                            {authUser ? (
                                <button
                                    type="button"
                                    className={cn(
                                        'tct-pressable inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px]',
                                        bookmarked ? 'text-foreground' : 'text-muted-foreground',
                                    )}
                                    onClick={() => setBookmarked((v) => !v)}
                                >
                                    <Bookmark className={cn('h-5 w-5', bookmarked ? 'fill-current' : '')} />
                                    <span>{bookmarkLabel}</span>
                                </button>
                            ) : null}
                        </div>

                        <div className="mt-3 space-y-1 px-1">
                            <p className="text-[10px] text-muted-foreground md:text-[11px]">{formatFullDateId(activeDay.date)}</p>
                            <h1 className="line-clamp-2 text-[17px] font-semibold leading-tight tracking-tight md:text-[20px]">
                                {activeDay.title ?? 'Untitled'}
                            </h1>
                        </div>
                    </section>

                    {/* Key Message card */}
                    <section
                        className={cn(
                            'rounded-3xl bg-surface-muted p-4 shadow-soft transition-all duration-200 will-change-transform',
                            transitioning ? 'opacity-70' : 'opacity-100',
                        )}
                        style={{ transform: `translateX(${animX}px)` }}
                    >
                        <p className="text-[16px] font-semibold">Key Message</p>
                        <div className="mt-3 h-px bg-border/70" />
                        {isLoading ? (
                            <div className="mt-3 animate-pulse space-y-3">
                                <div className="h-4 w-11/12 rounded bg-surface" />
                                <div className="h-4 w-10/12 rounded bg-surface" />
                                <div className="h-4 w-9/12 rounded bg-surface" />
                            </div>
                        ) : activeDay.content ? (
                            <div
                                className="reader-prose mt-3"
                                dangerouslySetInnerHTML={{
                                    __html: renderedContentHtml,
                                }}
                            />
                        ) : (
                            <p className="mt-3 text-[14px] text-muted-foreground">Key message belum tersedia.</p>
                        )}
                    </section>

                    {isAdmin ? (
                        <section className="rounded-3xl bg-surface-muted p-4 shadow-soft">
                            <div className="flex items-center justify-between">
                                <p className="text-[16px] font-semibold">Admin Editor</p>
                                <button
                                    type="button"
                                    className="rounded-full bg-surface px-3 py-1.5 text-[12px] font-semibold ring-1 ring-border/70"
                                    onClick={() => setAdminPanelOpen((v) => !v)}
                                >
                                    {adminPanelOpen ? 'Tutup' : 'Buka'}
                                </button>
                            </div>
                            {adminPanelOpen ? (
                                <div className="mt-3 space-y-3">
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                        <input value={adminDayKey} onChange={(e) => setAdminDayKey(e.target.value)} className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="day_key (sat/sun/...)" />
                                        <input value={adminDate} onChange={(e) => setAdminDate(e.target.value)} className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="YYYY-MM-DD" />
                                        <select value={adminStatus} onChange={(e) => setAdminStatus((e.target.value === 'published' ? 'published' : 'draft'))} className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none">
                                            <option value="draft">draft</option>
                                            <option value="published">published</option>
                                        </select>
                                    </div>
                                    <input value={adminTitle} onChange={(e) => setAdminTitle(e.target.value)} className="w-full rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="Judul materi" />
                                    <input value={adminCoverImageUrl} onChange={(e) => setAdminCoverImageUrl(e.target.value)} className="w-full rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="Cover image URL" />
                                    <textarea value={adminMediaLinksText} onChange={(e) => setAdminMediaLinksText(e.target.value)} rows={3} className="w-full rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="Media URL (1 baris 1 link)" />
                                    <textarea value={adminContent} onChange={(e) => setAdminContent(e.target.value)} rows={8} className="w-full rounded-2xl border border-border/70 bg-surface px-4 py-3 text-[14px] outline-none" placeholder="Isi materi pelajaran..." />

                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={saveAdminDay} disabled={adminSaving} className="rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background disabled:opacity-50">
                                            {adminSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                        <button type="button" onClick={deleteAdminDay} disabled={adminDeleting} className="rounded-full bg-rose-600 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
                                            {adminDeleting ? 'Menghapus...' : 'Hapus Hari Ini'}
                                        </button>
                                    </div>

                                    <div className="mt-2 rounded-2xl bg-surface p-3 ring-1 ring-border/60">
                                        <p className="text-[13px] font-semibold">Tambah Hari Baru (Create)</p>
                                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                                            <input value={newDayKey} onChange={(e) => setNewDayKey(e.target.value)} className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="day_key" />
                                            <input value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="YYYY-MM-DD" />
                                            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none" placeholder="Judul awal" />
                                        </div>
                                        <div className="mt-2">
                                            <button type="button" onClick={createAdminDay} disabled={adminCreating} className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50">
                                                {adminCreating ? 'Membuat...' : 'Buat Hari Baru'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </section>
                    ) : null}

                    {/* Discussion card */}
                    <section className="rounded-3xl bg-surface-muted p-4 shadow-soft">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <p className="text-[16px] font-semibold">Discussion</p>
                        </div>
                        <div className="mt-3 h-px bg-border/70" />

                        <div className="mt-3 space-y-3">
                            {commentsLoading ? (
                                <div className="animate-pulse space-y-2">
                                    <div className="h-16 rounded-2xl bg-surface" />
                                    <div className="h-16 rounded-2xl bg-surface" />
                                </div>
                            ) : (
                                threadedComments.map((node) => renderCommentNode(node, 0))
                            )}
                        </div>

                        {replyTarget ? (
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-[12px] ring-1 ring-black/5">
                                <span className="text-muted-foreground">Replying to <span className="font-semibold text-foreground">{replyTarget.author}</span></span>
                                <button
                                    type="button"
                                    className="font-semibold text-brand"
                                    onClick={() => setReplyTarget(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : null}

                        <div className="mt-3">
                            {!authUser ? (
                                <input
                                    value={guestAuthorName}
                                    onChange={(e) => setGuestAuthorName(e.target.value)}
                                    placeholder="Nama (opsional)"
                                    maxLength={80}
                                    className="mb-2 w-full rounded-xl border border-border/70 bg-surface px-3 py-2 text-[13px] outline-none transition focus:border-brand/70"
                                />
                            ) : null}
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={4}
                                placeholder="Tulis komentar untuk diskusi pelajaran hari ini..."
                                className="w-full resize-y rounded-2xl border border-border/70 bg-surface px-4 py-3 text-[14px] leading-relaxed outline-none transition focus:border-brand/70"
                            />
                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    className="tct-pressable rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-background disabled:opacity-50"
                                    onClick={() => submitComment(commentText)}
                                    disabled={!commentText.trim()}
                                >
                                    Kirim Komentar
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Other days */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[16px] font-semibold">Other Days</p>
                        </div>

                        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
                            {orderedDayKeys.map((k) => {
                                const isActive = k === activeDayKey;
                                const label = (dayLabel[k] ?? k).slice(0, 3);
                                const isAvailable = availableDayKeys.has(k);
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => setDay(k)}
                                        disabled={!isAvailable}
                                        className={cn(
                                            'tct-pressable relative flex h-9 flex-none items-center justify-center rounded-full px-4 text-[13px] font-semibold',
                                            isActive ? 'bg-surface-dark text-brand' : 'bg-surface-muted text-foreground',
                                            !isAvailable ? 'opacity-40' : '',
                                        )}
                                        aria-pressed={isActive}
                                    >
                                        {label}
                                        {isActive ? <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-brand" /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </MobileAppLayout>
    );
}

