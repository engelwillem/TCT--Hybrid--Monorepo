"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "../components/PostComposer";
import { MemberPostCard } from "../components/MemberPostCard";
import { CommentsSheet } from "../components/CommentsSheet";
import { VerseHubFeaturedCard, type FeaturedVerse } from "../components/VerseHubFeaturedCard";
import { CommunityPost } from "../types";
import { Inbox, Sparkles, MessageCircle, AlertTriangle, Bookmark } from "lucide-react";
import { CommunityService } from "@/services/community.service";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
  const isArchiveFallbackInDiscussion = !hasActivePosts && !isLoading && archivePosts.length > 0;
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
      
      const fetched = await CommunityService.listPosts();
      setPosts(fetched.posts);
      setArchivePosts(fetched.archivePosts);
      
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

  const handlePost = async (text: string, type: any, images: File[] = []) => {
    try {
      const newPost = await CommunityService.createPost(text, type, images);
      setPosts((prev) => [newPost, ...prev]);
      showToast("Berhasil membagikan!", "success");
    } catch (error) {
      console.error("Failed to create post", error);
      showToast("Gagal membagikan post.", "error");
    }
  };

  const toggleLike = async (postId: string) => {
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
      setPosts((prev) => patchServer(prev));
      setArchivePosts((prev) => patchServer(prev));
    } catch (error) {
      setPosts(originalPosts); 
      setArchivePosts(originalArchivePosts);
    }
  };

  const toggleBookmark = async (postId: string) => {
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
      setPosts((prev) => patchServer(prev));
      setArchivePosts((prev) => patchServer(prev));
      showToast(updatedPost.isBookmarked ? "Disimpan ke Simpanan" : "Dihapus dari Simpanan", "success");
    } catch (error) {
      setPosts(originalPosts);
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
        items: items,
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
            onOpenComments={setActiveCommentPostId}
        />

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
            ) : fetchError ? (
              <Card className="rounded-[40px] bg-red-50/10 border-red-500/20 shadow-none mt-4">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                    <AlertTriangle size={28} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-foreground tracking-tight">Gagal Memuat Feed</p>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">{fetchError}</p>
                  </div>
                  <button 
                    onClick={() => fetchData()}
                    className="mt-4 px-10 py-3 bg-foreground text-background rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                  >
                    Coba Lagi
                  </button>
                </CardContent>
              </Card>
            ) : discussionPosts.length ? (
              <div className="space-y-6">
                {isArchiveFallbackInDiscussion && (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-1000">
                    <div className="h-16 w-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shadow-premium">
                      <Sparkles className="h-7 w-7 text-brand" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[17px] font-black tracking-tight text-foreground">Inspirasi Pilihan</p>
                      <p className="text-[11px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60 leading-relaxed max-w-[280px] mx-auto">
                        Belum ada percakapan baru hari ini. Lihat kembali mutiara dari arsip kita.
                      </p>
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
                    prayLabel={String(p.counts.likes || 0)}
                    prayed={p.isLiked}
                    commentsCount={p.counts.comments || 0}
                    bookmarked={p.isBookmarked}
                    bookmarkLabel={String(p.counts.bookmarks || 0)}
                    onPray={() => toggleLike(p.id)}
                    onBookmark={() => toggleBookmark(p.id)}
                    onOpenComments={() => setActiveCommentPostId(p.id)}
                    onShare={() => handleShare(p.id, p.text)}
                  />
                ))}
              </div>
            ) : (
                <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none rounded-[40px] overflow-hidden mt-4">
                    <CardContent className="p-16 text-center flex flex-col items-center justify-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-surface-muted flex items-center justify-center text-muted-foreground/40 shadow-inner">
                            <MessageCircle size={32} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-foreground font-black text-[18px]">Mulai Percakapan</p>
                            <p className="text-[12px] text-muted-foreground font-medium max-w-[240px] leading-relaxed">Jadilah yang pertama berbagi terang dan berkat Anda hari ini.</p>
                        </div>
                        <button 
                          onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                          className="px-8 py-2.5 bg-brand text-brand-foreground rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand/20"
                        >
                          Tulis Sesuatu
                        </button>
                    </CardContent>
                </Card>
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
                        authorAvatar={p.author.avatarUrl}
                        type={p.type}
                        text={p.text}
                        imgSrc={p.imageUrl}
                        prayLabel={String(p.counts.likes || 0)}
                        prayed={p.isLiked}
                        commentsCount={p.counts.comments || 0}
                        bookmarked={p.isBookmarked}
                        bookmarkLabel={String(p.counts.bookmarks || 0)}
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
                <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none rounded-[40px] overflow-hidden">
                    <CardContent className="p-16 text-center flex flex-col items-center justify-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-surface-muted flex items-center justify-center text-muted-foreground/40 shadow-inner">
                            <Inbox size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground/80 font-black text-sm">Arsip Kosong</p>
                            <p className="text-[11px] text-muted-foreground font-medium">Belum ada jejak tersimpan untuk kategori ini.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6 outline-none">
            <div className="space-y-6">
                {posts.filter(p => p.isBookmarked).length > 0 ? (
                    posts.filter(p => p.isBookmarked).map(p => (
                        <MemberPostCard
                            key={p.id}
                            authorName={p.author.name}
                            authorAvatar={p.author.avatarUrl}
                            type={p.type}
                            text={p.text}
                            imgSrc={p.imageUrl}
                            prayLabel={String(p.counts.likes || 0)}
                            prayed={p.isLiked}
                            commentsCount={p.counts.comments || 0}
                            bookmarked={p.isBookmarked}
                            bookmarkLabel={String(p.counts.bookmarks || 0)}
                            onPray={() => toggleLike(p.id)}
                            onBookmark={() => toggleBookmark(p.id)}
                            onOpenComments={() => setActiveCommentPostId(p.id)}
                            onShare={() => handleShare(p.id, p.text)}
                        />
                    ))
                ) : (
                    <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none rounded-[40px] overflow-hidden">
                        <CardContent className="p-16 text-center flex flex-col items-center justify-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-surface-muted flex items-center justify-center text-muted-foreground/40 shadow-inner">
                                <Bookmark size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-foreground/80 font-black text-sm">Belum Ada Simpanan</p>
                                <p className="text-[11px] text-muted-foreground font-medium">Post yang Anda tandai akan muncul secara rapi di sini.</p>
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-foreground text-background px-6 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
          {toast.type === 'error' && <AlertTriangle size={16} className="text-red-400" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
