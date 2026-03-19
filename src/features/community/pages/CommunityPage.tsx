"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "../components/PostComposer";
import { MemberPostCard } from "../components/MemberPostCard";
import { CommentsSheet } from "../components/CommentsSheet";
import { VerseHubFeaturedCard, type FeaturedVerse } from "../components/VerseHubFeaturedCard";
import { CommunityPost } from "../types";
import { ChevronDown, Inbox, Sparkles, MessageCircle, AlertTriangle, Bookmark } from "lucide-react";
import { CommunityService } from "@/services/community.service";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeTab, setActiveTab] = useState<"discussions" | "archive" | "bookmarks">("discussions");
  const [archiveCategory, setArchiveCategory] = useState<ArchiveCategory>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [archivePosts, setArchivePosts] = useState<CommunityPost[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rituals, setRituals] = useState<any>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const hasActivePosts = posts.length > 0;
  const isArchiveFallbackInDiscussion = !hasActivePosts && archivePosts.length > 0;
  const discussionPosts = hasActivePosts ? posts : archivePosts.slice(0, 6);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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
      // Load feed
      const fetched = await CommunityService.listPosts();
      setPosts(fetched.posts);
      setArchivePosts(fetched.archivePosts);
      
      // Load rituals for featured verse
      const ritualRes = await fetch('/api/today');
      if (ritualRes.ok) {
          const ritualData = await ritualRes.json();
          setRituals(ritualData?.data?.rituals || null);
      }
    } catch (error: any) {
      console.error("Failed to fetch community data", error);
      setFetchError(error?.status === 401 ? "Unauthorized" : (error?.status === 503 ? "Server Unavailable" : "Failed to load feed"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePost = async (text: string, type: string, images: File[] = []) => {
    try {
      const newPost = await CommunityService.createPost(text, type, images);
      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  const toggleLike = async (postId: string) => {
    // Optimistic update for both active feed and archive fallback surfaces.
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
            likes: p.counts.likes + (isLiked ? 1 : -1),
          },
        };
      });

    setPosts((prev) => patchOptimistic(prev));
    setArchivePosts((prev) => patchOptimistic(prev));

    try {
      const updatedPost = await CommunityService.toggleLike(postId);
      const patchServer = (list: CommunityPost[]) =>
        list.map((p) => (p.id === postId ? updatedPost : p));
      setPosts((prev) => patchServer(prev));
      setArchivePosts((prev) => patchServer(prev));
    } catch (error) {
      console.error("Failed to toggle like", error);
      setPosts(originalPosts); // Rollback
      setArchivePosts(originalArchivePosts);
    }
  };

  const toggleBookmark = async (postId: string) => {
    // Optimistic update for both active feed and archive fallback surfaces.
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
            bookmarks: p.counts.bookmarks + (isBookmarked ? 1 : -1),
          },
        };
      });

    setPosts((prev) => patchOptimistic(prev));
    setArchivePosts((prev) => patchOptimistic(prev));

    try {
      const updatedPost = await CommunityService.toggleBookmark(postId);
      const patchServer = (list: CommunityPost[]) =>
        list.map((p) => (p.id === postId ? updatedPost : p));
      setPosts((prev) => patchServer(prev));
      setArchivePosts((prev) => patchServer(prev));
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      setPosts(originalPosts); // Rollback
      setArchivePosts(originalArchivePosts);
    }
  };

  const handleShare = async (postId: string, text?: string | null) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thechoosentalks.org";
    const url = `${baseUrl}/community/posts/${postId}/share`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "TheChosenTalks Community",
          text: text ? text.substring(0, 100) + "..." : "Bagikan pos inspirasi ini.",
          url: url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Tautan disalin ke papan klip!", "success");
      } catch (err) {
        console.error("Error copying link:", err);
        showToast("Gagal menyalin tautan.", "error");
      }
    }
  };

  const featuredPost = useMemo(() => posts.find((p) => p.isFeatured), [posts]);
  
  const effectiveFeaturedVerse = useMemo((): FeaturedVerse => {
    const ritualVerse = rituals?.today_verse ?? null;
    if (ritualVerse?.quote) {
        return {
            ref: slugifyRef(ritualVerse.reference || 'mzm-23-1'),
            href: ritualVerse.cta_href || `/versehub/id?ref=${slugifyRef(ritualVerse.reference || '')}`,
            text: ritualVerse.text || ritualVerse.quote,
            reference: ritualVerse.reference || "Ayat Hari Ini",
        };
    }

    const meta = featuredPost?.metadata || {};
    if (meta.ref || meta.reference) {
      return {
        ref: meta.ref || slugifyRef(meta.reference || ''),
        href: `/versehub/id?ref=${meta.ref || slugifyRef(meta.reference || '')}`,
        text: meta.quote || featuredPost?.text || "",
        reference: meta.reference || "Featured Reflection",
      };
    }

    return {
      ref: "mzm-23-1",
      href: "/versehub/id?ref=mzm-23-1",
      text: "TUHAN adalah gembalaku, takkan kekurangan aku.",
      reference: "Mazmur 23:1",
    };
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
        items: items, // Ordering is naturally handed by Backend already
      }));
  }, [archivePosts, archiveCategory]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 md:py-6">
      <header className="px-6 md:px-0 mx-auto w-full max-w-[640px] space-y-2 pb-6">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground"><span className="text-brand">Komunitas</span></h2>
        <p className="text-sm font-medium tracking-wide leading-relaxed text-muted-foreground/80">
          Tempat berbagi inspirasi, doa, dan pertumbuhan bersama.
        </p>
      </header>

      <div className="mx-auto w-full max-w-[640px] space-y-6 px-6 md:px-0 pb-28">
        <VerseHubFeaturedCard 
            verse={effectiveFeaturedVerse} 
            postId={featuredPost?.id}
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <div className="sticky top-0 z-40 py-2 -mx-1 px-1">
            <TabsList className="relative flex h-[52px] w-full items-center justify-between rounded-[20px] bg-surface/70 backdrop-blur-xl shadow-sm ring-1 ring-border/50 overflow-hidden text-foreground">
              {[
                { id: "discussions", label: "Diskusi" },
                { id: "archive", label: "Arsip" },
                { id: "bookmarks", label: "Simpanan" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "relative flex-1 h-full rounded-[14px] text-[12px] font-black uppercase tracking-widest transition-all duration-300 z-10",
                    "data-[state=active]:bg-surface-elevated data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border/50",
                    "data-[state=inactive]:text-muted-foreground/70 hover:text-foreground"
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="discussions" className="space-y-6 mt-0">
            <Suspense fallback={<PostComposer onPost={handlePost} />}>
              <SmartPostComposer onPost={handlePost} />
            </Suspense>

            {isLoading ? (
                <div className="space-y-4 pt-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="border-none bg-surface-muted/30 shadow-sm rounded-[24px]">
                            <CardContent className="p-5 flex gap-4">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="flex-1 space-y-3 pt-1">
                                    <Skeleton className="h-4 w-32 rounded-full" />
                                    <Skeleton className="h-3 w-full rounded-full" />
                                    <Skeleton className="h-3 w-4/5 rounded-full" />
                                    <Skeleton className="h-24 w-full rounded-[16px] mt-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : fetchError ? (
              <Card className="rounded-[32px] bg-red-50/50 border-red-100 shadow-sm mt-4">
                <CardContent className="p-12 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-2">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="text-lg font-black text-red-600 tracking-tight">{fetchError === "Unauthorized" ? "Silakan Masuk Kembali" : "Gagal Memperbarui Feed"}</p>
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest">{fetchError}</p>
                  <button 
                    onClick={() => fetchData()}
                    className="mt-4 px-8 py-2.5 bg-red-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm active:scale-95"
                  >
                    Coba Lagi
                  </button>
                </CardContent>
              </Card>
            ) : discussionPosts.length ? (
              <div className="space-y-5">
                {isArchiveFallbackInDiscussion && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-3 animate-in fade-in">
                    <div className="h-14 w-14 rounded-full bg-surface-muted border border-border/50 flex items-center justify-center shadow-inner">
                      <Sparkles className="h-6 w-6 text-brand opacity-80" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[14px] font-black tracking-wide text-foreground/80">Belum ada percakapan baru</p>
                      <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground">Menampilkan inspirasi dari arsip komunitas</p>
                    </div>
                  </div>
                )}
                {discussionPosts.map((p) => (
                <MemberPostCard
                  key={p.id}
                  authorName={p.author.name}
                  authorAvatar={p.author.avatarUrl}
                  isOfficial={p.author.isOfficial}
                  type={p.type}
                  text={p.text}
                  imgSrc={p.imageUrl || undefined}
                  mediaSrcList={p.mediaPaths || undefined}
                  prayLabel={String(p.counts.likes)}
                  prayed={p.isLiked}
                  commentsCount={p.counts.comments}
                  bookmarked={p.isBookmarked}
                  bookmarkLabel={String(p.counts.bookmarks)}
                  onPray={() => toggleLike(p.id)}
                  onBookmark={() => toggleBookmark(p.id)}
                  onOpenComments={() => setActiveCommentPostId(p.id)}
                  onShare={() => handleShare(p.id, p.text)}
                />
                ))}
              </div>
            ) : (
                <Card className="border-dashed border-2 border-border/50 bg-surface/30 shadow-none rounded-[32px] overflow-hidden mt-4">
                    <CardContent className="p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground shadow-inner">
                            <MessageCircle size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground/80 font-black text-sm">Belum ada percakapan aktif</p>
                            <p className="text-[11px] text-muted-foreground font-medium">Jadilah yang pertama berbagi cerita Anda hari ini.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
          </TabsContent>

          <TabsContent value="archive" className="space-y-6 mt-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide text-foreground px-1 -mx-1">
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
                      "whitespace-nowrap rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all",
                      active
                        ? "bg-foreground text-background shadow-md border border-foreground"
                        : "bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-border/50 shadow-sm"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {archiveGroups.length ? (
              <div className="space-y-8">
              {archiveGroups.map((group) => (
                <section key={group.key} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                      {group.label}
                    </p>
                    <ChevronDown size={14} className="text-muted-foreground/30" />
                  </div>
                  <div className="space-y-5">
                    {group.items.map((p) => (
                      <MemberPostCard
                        key={p.id}
                        authorName={p.author.name}
                        authorAvatar={p.author.avatarUrl}
                        type={p.type}
                        text={p.text}
                        imgSrc={p.imageUrl}
                        compact
                        className="opacity-95"
                        prayLabel={String(p.counts.likes)}
                        prayed={p.isLiked}
                        commentsCount={p.counts.comments}
                        bookmarked={p.isBookmarked}
                        bookmarkLabel={String(p.counts.bookmarks)}
                        onPray={() => toggleLike(p.id)}
                        onBookmark={() => toggleBookmark(p.id)}
                        onOpenComments={() => setActiveCommentPostId(p.id)}
                        onShare={() => handleShare(p.id, p.text)}
                      />
                    ))}
                  </div>
                </section>
              ))}
              </div>
            ) : (
                <Card className="border-dashed border-2 border-border/50 bg-surface/30 shadow-none rounded-[32px] overflow-hidden mt-4">
                    <CardContent className="p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground shadow-inner">
                            <Inbox size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground/80 font-black text-sm">Arsip Kosong</p>
                            <p className="text-[11px] text-muted-foreground font-medium">Belum ada percakapan yang masuk ke arsip untuk kategori ini.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            <div className="space-y-5">
                {posts.filter(p => p.isBookmarked).length > 0 ? (
                    posts.filter(p => p.isBookmarked).map(p => (
                        <MemberPostCard
                            key={p.id}
                            authorName={p.author.name}
                            authorAvatar={p.author.avatarUrl}
                            type={p.type}
                            text={p.text}
                            imgSrc={p.imageUrl}
                            prayLabel={String(p.counts.likes)}
                            prayed={p.isLiked}
                            commentsCount={p.counts.comments}
                            bookmarked={p.isBookmarked}
                            bookmarkLabel={String(p.counts.bookmarks)}
                            onPray={() => toggleLike(p.id)}
                            onBookmark={() => toggleBookmark(p.id)}
                            onOpenComments={() => setActiveCommentPostId(p.id)}
                            onShare={() => handleShare(p.id, p.text)}
                        />
                    ))
                ) : (
                    <Card className="border-dashed border-2 border-border/50 bg-surface/30 shadow-none rounded-[32px] overflow-hidden mt-4">
                        <CardContent className="p-12 text-center flex flex-col items-center justify-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground shadow-inner">
                                <Bookmark size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-foreground/80 font-black text-sm">Belum ada post tersimpan</p>
                                <p className="text-[11px] text-muted-foreground font-medium">Beri markah pada pos untuk membukanya kembali di sini.</p>
                            </div>
                        </CardContent>
                    </Card>
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

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-surface-elevated/95 border border-border/50 px-5 py-3 text-[12px] font-black uppercase tracking-widest text-foreground shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 fade-in">
          {toast.type === 'error' && <AlertTriangle size={16} className="text-red-500" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
