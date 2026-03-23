"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "../components/PostComposer";
import { MemberPostCard } from "../components/MemberPostCard";
import { CommentsSheet } from "../components/CommentsSheet";
import { AuthExecutionGate } from "../components/AuthExecutionGate";
import { VerseHubFeaturedCard, type FeaturedVerse } from "../components/VerseHubFeaturedCard";
import { CommunityPost } from "../types";
import { Inbox, Sparkles, MessageCircle, AlertTriangle, Bookmark } from "lucide-react";
import { CommunityService } from "@/services/community.service";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthSession } from "@/auth/use-auth-session";
import { buildWhatsAppShareUrl, copyToClipboard, getCanonicalUrl } from "@/lib/share";

type ArchiveCategory = "all" | "quotes" | "reflections" | "prayer_requests" | "testimonies";

const slugifyRef = (ref: string) =>
    ref.toLowerCase().trim()
        .replace(/[:\.\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

function SmartPostComposer({ onPost }: { onPost: any }) {
  const searchParams = useSearchParams();
  const intent = searchParams?.get("intent");
  const text = searchParams?.get("text") || "";
  
  const isReflection = intent === "reflection";
  const initialExpanded = isReflection || text.length > 0;
  
  return (
    <PostComposer 
      onPost={onPost} 
      initialType={isReflection ? "reflection" : "user_post"} 
      initialText={text}
      initialExpanded={initialExpanded}
    />
  );
}

export function CommunityPage() {
  const COMMUNITY_FEED_CACHE_KEY = "tct.community.feed.cache.v1";
  const { isAuthenticated, isRestoring } = useAuthSession();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeTab, setActiveTab] = useState<"discussions" | "archive" | "bookmarks">("discussions");
  const [archiveCategory, setArchiveCategory] = useState<ArchiveCategory>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [archivePosts, setArchivePosts] = useState<CommunityPost[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rituals, setRituals] = useState<any>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateContent, setAuthGateContent] = useState<{ title: string; description: string }>({
    title: "Tulisanmu sudah siap.",
    description: "Daftar atau masuk untuk membagikannya. Kamu bisa lanjut menulis tanpa kehilangan draft.",
  });
  const resolveAuthorAvatar = (post: CommunityPost): string | null => {
    const author = post.author as CommunityPost["author"] & {
      profileImage?: string | null;
      profile_image?: string | null;
    };
    return author.avatarUrl ?? author.profileImage ?? author.profile_image ?? null;
  };
  
  const discussionPosts = posts;
  const bookmarkedPosts = useMemo(() => {
    const merged = [...posts, ...archivePosts];
    const seen = new Set<string>();
    return merged.filter((post) => {
      if (!post.isBookmarked) return false;
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [posts, archivePosts]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const persistFeedCache = useCallback((nextPosts: CommunityPost[], nextArchivePosts: CommunityPost[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      COMMUNITY_FEED_CACHE_KEY,
      JSON.stringify({
        posts: nextPosts,
        archivePosts: nextArchivePosts,
        cachedAt: new Date().toISOString(),
      })
    );
  }, [COMMUNITY_FEED_CACHE_KEY]);

  const openAuthGate = useCallback(
    (mode: "share" | "interact") => {
      if (mode === "share") {
        setAuthGateContent({
          title: "Tulisanmu sudah siap.",
          description: "Daftar atau masuk untuk membagikannya. Kamu bisa lanjut menulis tanpa kehilangan draft.",
        });
      } else {
        setAuthGateContent({
          title: "Lanjutkan langkahmu.",
          description: "Masuk atau daftar untuk ikut berinteraksi dengan komunitas.",
        });
      }
      setAuthGateOpen(true);
    },
    []
  );

  const handleCommentsUpdated = useCallback((postId: string, count: number) => {
    const patchComments = (list: CommunityPost[]) =>
      list.map((p) =>
        p.id === postId
          ? { ...p, counts: { ...p.counts, comments: count } }
          : p
      );

    setPosts((prev) => patchComments(prev));
    setArchivePosts((prev) => patchComments(prev));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      
      const fetched = await CommunityService.listPosts();
      setPosts(fetched.posts);
      setArchivePosts(fetched.archivePosts);
      persistFeedCache(fetched.posts, fetched.archivePosts);
      
      const ritualRes = await fetch('/api/today');
      if (ritualRes.ok) {
          const ritualData = await ritualRes.json();
          setRituals(ritualData?.data?.rituals || null);
      }
    } catch (error: any) {
      const status = Number(error?.status || 0);
      const isExpectedAvailabilityIssue = status === 401 || status === 403 || status === 503;

      if (!isExpectedAvailabilityIssue) {
        console.error("Failed to fetch community data", error);
      }

      setFetchError(
        status === 401 || status === 403
          ? "Unauthorized"
          : status === 503
            ? "Server Unavailable"
            : "Failed to load feed"
      );
      let usedCachedFeed = false;
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(COMMUNITY_FEED_CACHE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { posts?: CommunityPost[]; archivePosts?: CommunityPost[] };
            const cachedPosts = Array.isArray(parsed.posts) ? parsed.posts : [];
            const cachedArchive = Array.isArray(parsed.archivePosts) ? parsed.archivePosts : [];
            if (cachedPosts.length > 0 || cachedArchive.length > 0) {
              setPosts(cachedPosts);
              setArchivePosts(cachedArchive);
              usedCachedFeed = true;
            }
          }
        } catch {
          // ignore cache parse errors
        }
      }

      if (!usedCachedFeed) {
        setPosts([]);
        setArchivePosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [persistFeedCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePost = async (text: string, type: any, images: File[] = []) => {
    if (isRestoring) {
      return false;
    }
    if (!isAuthenticated) {
      openAuthGate("share");
      return false;
    }
    try {
      const newPost = await CommunityService.createPost(text, type, images);
      setPosts((prev) => {
        const nextPosts = [newPost, ...prev];
        persistFeedCache(nextPosts, archivePosts);
        return nextPosts;
      });
      showToast("Berhasil membagikan!", "success");
      return true;
    } catch (error) {
      console.error("Failed to create post", error);
      showToast("Gagal membagikan post.", "error");
      return false;
    }
  };

  const toggleLike = async (postId: string) => {
    if (isRestoring) {
      return;
    }
    if (!isAuthenticated) {
      openAuthGate("interact");
      return;
    }
    const originalPosts = [...posts];
    const originalArchivePosts = [...archivePosts];
    const patchOptimistic = (list: CommunityPost[]) =>
      list.map((p) => {
        if (p.id !== postId) return p;
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          counts: {
            ...p.counts,
            likes: (p.counts.likes || 0) + (isLiked ? 1 : -1),
          },
        };
      });

    setPosts((prev) => patchOptimistic(prev));
    setArchivePosts((prev) => patchOptimistic(prev));

    try {
      const updatedPost = await CommunityService.toggleLike(postId);
      const patchServer = (list: CommunityPost[]) =>
        list.map((p) => (p.id === postId ? updatedPost : p));
      setPosts((prev) => {
        const nextPosts = patchServer(prev);
        setArchivePosts((prevArchive) => {
          const nextArchive = patchServer(prevArchive);
          persistFeedCache(nextPosts, nextArchive);
          return nextArchive;
        });
        return nextPosts;
      });
    } catch (error) {
      setPosts(originalPosts); 
      setArchivePosts(originalArchivePosts);
    }
  };

  const toggleBookmark = async (postId: string) => {
    if (isRestoring) {
      return;
    }
    if (!isAuthenticated) {
      openAuthGate("interact");
      return;
    }
    const originalPosts = [...posts];
    const originalArchivePosts = [...archivePosts];
    const patchOptimistic = (list: CommunityPost[]) =>
      list.map((p) => {
        if (p.id !== postId) return p;
        const isBookmarked = !p.isBookmarked;
        return {
          ...p,
          isBookmarked,
          counts: {
            ...p.counts,
            bookmarks: (p.counts.bookmarks || 0) + (isBookmarked ? 1 : -1),
          },
        };
      });

    setPosts((prev) => patchOptimistic(prev));
    setArchivePosts((prev) => patchOptimistic(prev));

    try {
      const updatedPost = await CommunityService.toggleBookmark(postId);
      const patchServer = (list: CommunityPost[]) =>
        list.map((p) => (p.id === postId ? updatedPost : p));
      setPosts((prev) => {
        const nextPosts = patchServer(prev);
        setArchivePosts((prevArchive) => {
          const nextArchive = patchServer(prevArchive);
          persistFeedCache(nextPosts, nextArchive);
          return nextArchive;
        });
        return nextPosts;
      });
      showToast(updatedPost.isBookmarked ? "Disimpan ke Simpanan" : "Dihapus dari Simpanan", "success");
    } catch (error) {
      setPosts(originalPosts);
      setArchivePosts(originalArchivePosts);
    }
  };

  const handleShare = async (postId: string, text?: string | null) => {
    const url = getCanonicalUrl(`/community/posts/${postId}/share`);
    const shortText = text ? text.substring(0, 100) + "..." : "Bagikan pos inspirasi ini.";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "TheChosenTalks Community",
          text: shortText,
          url: url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      const copied = await copyToClipboard(url);
      if (copied) {
        showToast("Tautan disalin ke papan klip!", "success");
      } else {
        window.open(buildWhatsAppShareUrl(`${shortText} ${url}`), "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleOpenComments = useCallback(
    (postId: string) => {
      if (isRestoring) {
        return;
      }
      if (!isAuthenticated) {
        openAuthGate("interact");
        return;
      }
      setActiveCommentPostId(postId);
    },
    [isAuthenticated, isRestoring, openAuthGate]
  );

  const featuredPost = useMemo(() => posts.find((p) => p.isFeatured), [posts]);
  
  const effectiveFeaturedVerse = useMemo<FeaturedVerse | null>(() => {
    const ritualVerse = rituals?.today_verse ?? null;
    if (ritualVerse?.quote) {
        return {
            ref: slugifyRef(ritualVerse.reference || 'mzm-23-1'),
            href: ritualVerse.cta_href || `/versehub/id?ref=${slugifyRef(ritualVerse.reference || '')}`,
            text: ritualVerse.text || ritualVerse.quote,
            reference: ritualVerse.reference || "Ayat Hari Ini",
            imageUrl: ritualVerse.image_url || ritualVerse.imageUrl || undefined,
        };
    }

    const meta = featuredPost?.metadata || {};
    if (meta.ref || meta.reference) {
      return {
        ref: meta.ref || slugifyRef(meta.reference || ''),
        href: `/versehub/id?ref=${meta.ref || slugifyRef(meta.reference || '')}`,
        text: meta.quote || featuredPost?.text || "",
        reference: meta.reference || "Featured Reflection",
        imageUrl: meta.imageUrl || featuredPost?.mediaPaths?.[0] || undefined,
      };
    }

    return null;
  }, [rituals, featuredPost]);

  const archiveGroups = useMemo(() => {
    const filtered = archivePosts.filter((post) => {
      if (archiveCategory === "all") return true;
      const typeMapping: Record<string, string> = {
        quotes: "quote",
        reflections: "reflection",
        prayer_requests: "prayer_request",
        testimonies: "testimony",
      };
      return post.type === (typeMapping[archiveCategory] ?? archiveCategory);
    });

    const map = new Map<string, CommunityPost[]>();
    const todayKey = new Date().toISOString().slice(0, 10);

    filtered.forEach((p) => {
      const dateKey = p.createdAt ? p.createdAt.slice(0, 10) : todayKey;
      const key = dateKey === todayKey ? "today" : `month-${dateKey.slice(0, 7)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => ({
        key,
        label: key === "today" ? "Hari Ini" : key.replace("month-", ""),
        items: items,
      }));
  }, [archivePosts, archiveCategory]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 md:py-6">
    <header className="px-2 md:px-0 mx-auto w-full max-w-[640px] pb-8 pt-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-4">
          Community
        </p>
        <h1 className="tct-serif text-[26px] leading-[1.25] tracking-tight text-foreground/90 mb-2">
          Ruang berbagi dan bertumbuh bersama.
        </h1>
        <p className="text-[14px] font-medium tracking-wide leading-relaxed text-foreground/45">
          Inspirasi, doa, dan kesaksian dari komunitas.
        </p>
      </header>

      <div className="mx-auto w-full max-w-[640px] space-y-6 px-2 md:px-0 pb-28">
        {effectiveFeaturedVerse && (
          <VerseHubFeaturedCard 
              verse={effectiveFeaturedVerse} 
              postId={featuredPost?.id}
              onOpenComments={setActiveCommentPostId}
          />
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <div className="sticky top-0 z-40 py-2 -mx-1 px-1">
            <TabsList className="relative flex h-[56px] w-full items-center justify-between rounded-[24px] bg-background/60 backdrop-blur-2xl shadow-sm ring-1 ring-border/50 overflow-hidden text-foreground p-1">
              {[
                { id: "discussions", label: "Diskusi" },
                { id: "archive", label: "Arsip" },
                { id: "bookmarks", label: "Simpanan" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "relative flex-1 h-full rounded-[20px] text-[12px] font-black uppercase tracking-widest transition-all duration-300 z-10",
                    "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-lg",
                    "data-[state=inactive]:text-muted-foreground/60 hover:text-foreground/80"
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="discussions" className="space-y-6 mt-0 outline-none">
            <Suspense fallback={<div className="h-32 w-full bg-surface-muted animate-pulse rounded-[32px]" />}>
              <SmartPostComposer onPost={handlePost} />
            </Suspense>



            {isLoading ? (
                <div className="space-y-6 mt-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-[40px] bg-surface-muted/30 p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32 rounded-full" />
                                    <Skeleton className="h-3 w-20 rounded-full" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full rounded-full" />
                            <Skeleton className="h-4 w-5/6 rounded-full" />
                            <Skeleton className="h-48 w-full rounded-[32px] mt-4" />
                        </div>
                    ))}
                </div>
            ) : discussionPosts.length ? (
              <div className="space-y-6">

                {discussionPosts.map((p) => (
                  <MemberPostCard
                    key={p.id}
                    authorName={p.author.name}
                    authorAvatar={resolveAuthorAvatar(p)}
                    isOfficial={p.author.isOfficial}
                    type={p.type}
                    text={p.text}
                    imgSrc={p.imageUrl || undefined}
                    mediaSrcList={p.mediaPaths || undefined}
                    createdAt={p.createdAt}
                    prayLabel={String(p.counts.likes || 0)}
                    prayed={p.isLiked}
                    commentsCount={p.counts.comments || 0}
                    bookmarked={p.isBookmarked}
                    bookmarkLabel={String(p.counts.bookmarks || 0)}
                    onPray={() => toggleLike(p.id)}
                    onBookmark={() => toggleBookmark(p.id)}
                    onOpenComments={() => handleOpenComments(p.id)}
                    onShare={() => handleShare(p.id, p.text)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 pt-12 pb-24 max-w-[420px]">
                <p className="text-[15px] leading-relaxed text-foreground/70">
                  Belum ada percakapan hari ini.
                </p>
                <button 
                  onClick={() => fetchData()}
                  className="mt-6 text-[13px] font-medium text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  Muat ulang
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archive" className="space-y-8 mt-6 outline-none">
            <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide text-foreground px-1 -mx-1">
              {[
                { key: "all", label: "Semua" },
                { key: "quotes", label: "Quotes" },
                { key: "reflections", label: "Refleksi" },
                { key: "prayer_requests", label: "Doa" },
                { key: "testimonies", label: "Kesaksian" },
              ].map((item) => {
                const active = archiveCategory === (item.key as ArchiveCategory);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setArchiveCategory(item.key as ArchiveCategory)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300",
                      active
                        ? "bg-foreground text-background shadow-premium"
                        : "bg-surface-muted/50 text-muted-foreground/60 hover:text-foreground hover:bg-surface-muted ring-1 ring-border/50"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {archiveGroups.length ? (
              <div className="space-y-12">
              {archiveGroups.map((group) => (
                <section key={group.key} className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                      {group.label}
                    </p>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50" />
                  </div>
                  <div className="space-y-6">
                    {group.items.map((p) => (
                      <MemberPostCard
                        key={p.id}
                        authorName={p.author.name}
                        authorAvatar={resolveAuthorAvatar(p)}
                        type={p.type}
                        text={p.text}
                        imgSrc={p.imageUrl}
                        createdAt={p.createdAt}
                        prayLabel={String(p.counts.likes || 0)}
                        prayed={p.isLiked}
                        commentsCount={p.counts.comments || 0}
                        bookmarked={p.isBookmarked}
                        bookmarkLabel={String(p.counts.bookmarks || 0)}
                        onPray={() => toggleLike(p.id)}
                        onBookmark={() => toggleBookmark(p.id)}
                        onOpenComments={() => handleOpenComments(p.id)}
                        onShare={() => handleShare(p.id, p.text)}
                      />
                    ))}
                  </div>
                </section>
              ))}
              </div>
            ) : (
              <div className="px-4 pt-12 pb-24 max-w-[420px]">
                <p className="text-[15px] leading-relaxed text-foreground/70">
                  Arsip belum tersedia.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6 outline-none">
            <div className="space-y-6">
                {bookmarkedPosts.length > 0 ? (
                    bookmarkedPosts.map(p => (
                        <MemberPostCard
                            key={p.id}
                            authorName={p.author.name}
                            authorAvatar={resolveAuthorAvatar(p)}
                            type={p.type}
                            text={p.text}
                            imgSrc={p.imageUrl}
                            mediaSrcList={p.mediaPaths || undefined}
                            createdAt={p.createdAt}
                            prayLabel={String(p.counts.likes || 0)}
                            prayed={p.isLiked}
                            commentsCount={p.counts.comments || 0}
                            bookmarked={p.isBookmarked}
                            bookmarkLabel={String(p.counts.bookmarks || 0)}
                            onPray={() => toggleLike(p.id)}
                            onBookmark={() => toggleBookmark(p.id)}
                            onOpenComments={() => handleOpenComments(p.id)}
                            onShare={() => handleShare(p.id, p.text)}
                        />
                    ))
                ) : (
              <div className="px-4 pt-12 pb-24 max-w-[420px]">
                <p className="text-[15px] leading-relaxed text-foreground/70">
                  Belum ada simpanan.
                </p>
              </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CommentsSheet 
        isOpen={!!activeCommentPostId}
        onOpenChange={(open) => !open && setActiveCommentPostId(null)}
        postId={activeCommentPostId}
        onCommentsUpdated={handleCommentsUpdated}
      />

      <AuthExecutionGate
        open={authGateOpen}
        onOpenChange={setAuthGateOpen}
        title={authGateContent.title}
        description={authGateContent.description}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-foreground text-background px-6 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
          {toast.type === 'error' && <AlertTriangle size={16} className="text-red-400" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
