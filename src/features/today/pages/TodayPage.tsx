"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Quote, 
  BookOpen, 
  Route, 
  Inbox, 
  PlusCircle, 
  ChevronRight,
  Heart,
  MessageCircle,
  Sparkles,
  Wind
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CommunityPost } from "@/features/community/types";

export function TodayPage() {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/today');
        if (res.ok) {
           const payload = await res.json();
           const data = payload?.data || {};
           setHighlights(data.highlights || []);
           setDailyVerse(data.dailyVerse || null);
        }
      } catch (e) {
        console.error("Failed to fetch today data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayHighlights = highlights.slice(0, 4);

  const quickActions = [
    { label: "Community", icon: PlusCircle, href: "/community", color: "bg-blue-500/10 text-blue-600", desc: "Bagikan inspirasi" },
    { label: "VerseHub", icon: BookOpen, href: "/versehub/id", color: "bg-teal-500/10 text-teal-600", desc: "Baca firman" },
    { label: "Journey", icon: Route, href: "/journey", color: "bg-purple-500/10 text-purple-600", desc: "Riwayat dan progres rohani" },
    { label: "Inbox", icon: Inbox, href: "/inbox", color: "bg-orange-500/10 text-orange-600", desc: "Pesan masuk" },
  ];

  const currentDate = new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="flex flex-col h-full bg-transparent animate-in fade-in duration-700 space-y-8 md:py-10">
      {/* Header Responsif */}
      <header className="px-6 md:px-0 space-y-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight"><span className="text-brand">Selamat Pagi</span>, Chosen</h2>
            <p className="text-muted-foreground/80 font-medium text-sm md:text-base">Inspirasi harian Anda sudah siap untuk hari ini.</p>
          </div>
          <Badge variant="secondary" className="w-fit bg-surface-elevated text-foreground border border-border/50 h-8 px-4 rounded-full font-black text-xs uppercase tracking-widest shadow-sm">
            {currentDate}
          </Badge>
        </div>
      </header>

      {/* Grid Layout Utama untuk Web */}
      <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-24">
        
        {/* Kolom Kiri: Ayat & Highlights */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Daily Verse Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-brand pl-2">
              <Sparkles size={16} className="animate-pulse opacity-70" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Ayat Hari Ini</h3>
            </div>
            
            {isLoading ? (
                <Card className="border-none bg-surface-muted/30 shadow-sm rounded-[32px] overflow-hidden">
                    <CardContent className="p-8 md:p-12 space-y-6">
                        <Skeleton className="h-6 w-3/4 mx-auto rounded-full" />
                        <Skeleton className="h-6 w-2/3 mx-auto rounded-full" />
                        <Skeleton className="h-6 w-1/2 mx-auto rounded-full" />
                        <div className="pt-4 flex flex-col items-center gap-4">
                            <Skeleton className="h-4 w-32 rounded-full" />
                            <Skeleton className="h-10 w-40 rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            ) : dailyVerse ? (
                <Card className="relative bg-gradient-to-br from-brand/5 via-surface to-surface-elevated border-border/50 shadow-soft overflow-hidden group rounded-[32px] ring-1 ring-border/50">
                <Quote size={120} className="absolute -right-4 -bottom-4 text-brand/5 rotate-12" />
                <CardContent className="p-8 md:p-12 text-center space-y-8 relative z-10">
                    <p className="text-xl md:text-2xl font-serif font-medium text-foreground/90 leading-relaxed max-w-2xl mx-auto">
                    &quot;{dailyVerse.quote || dailyVerse.text}&quot;
                    </p>
                    <div className="space-y-5">
                    <p className="text-brand font-black text-sm tracking-[0.15em] uppercase">— {dailyVerse.reference}</p>
                    <Button asChild size="lg" className="rounded-full shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all bg-foreground text-background hover:bg-foreground/90 font-bold px-8">
                        <Link href={`/versehub/id?ref=${dailyVerse.reference.replace(/\s+/g, '-').toLowerCase()}`}>Renungkan</Link>
                    </Button>
                    </div>
                </CardContent>
                </Card>
            ) : (
                <Card className="border-dashed border-2 border-border/50 bg-surface/50 shadow-none rounded-[32px] overflow-hidden">
                    <CardContent className="p-12 text-center flex flex-col items-center justify-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-surface-elevated flex items-center justify-center text-muted-foreground shadow-inner">
                            <Wind size={24} />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm">Ayat hari ini belum diterbitkan.</p>
                        <Button asChild variant="outline" size="sm" className="rounded-full mt-2 font-bold uppercase tracking-widest text-[10px]">
                            <Link href="/versehub/id">Buka Library</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </section>

          {/* Community Highlights */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pl-2 pr-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Sorotan Komunitas</h3>
              <Link href="/community" className="text-[10px] font-black text-brand uppercase flex items-center gap-1 hover:text-brand/80 transition-colors">
                Lihat Semua <ChevronRight size={12} />
              </Link>
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <Card key={i} className="border-none bg-surface-muted/30 shadow-sm rounded-[24px]">
                            <CardContent className="p-5 flex gap-4">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="flex-1 space-y-3 pt-1">
                                    <Skeleton className="h-4 w-24 rounded-full" />
                                    <Skeleton className="h-3 w-full rounded-full" />
                                    <Skeleton className="h-3 w-4/5 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : displayHighlights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayHighlights.map((post, i) => (
                        <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        >
                        <Link href="/community">
                            <Card className="border-none ring-1 ring-border/50 hover:border-border hover:ring-brand/30 transition-all active:scale-[0.98] h-full bg-surface/60 backdrop-blur-md rounded-[24px] shadow-sm hover:shadow-md">
                            <CardContent className="p-5 flex gap-4">
                                <Avatar className="w-10 h-10 border border-border/50 shadow-sm shrink-0">
                                <AvatarImage src={post.author?.avatarUrl || post.author?.avatar_url} />
                                <AvatarFallback className="bg-surface-elevated text-xs font-black">{post.author?.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <p className="text-[13px] font-black truncate text-foreground/90">{post.author?.name || 'Member'}</p>
                                    <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">{post.createdAt || post.created_at || 'Baru'}</span>
                                </div>
                                <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                                    {post.text || (post.imageUrl ? "Membagikan foto bermakna..." : "")}
                                </p>
                                <div className="flex items-center gap-3 pt-2">
                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80 font-black tracking-widest">
                                    <Heart size={12} className={post.isLiked ? "text-rose-500 fill-current" : ""} /> 
                                    {post.counts?.likes ?? post.stats?.pray_count ?? 0}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80 font-black tracking-widest">
                                    <MessageCircle size={12} /> 
                                    {post.counts?.comments ?? post.stats?.comments_count ?? 0}
                                    </span>
                                </div>
                                </div>
                            </CardContent>
                            </Card>
                        </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-2 border-border/50 bg-surface/30 shadow-none rounded-[24px]">
                    <CardContent className="p-8 text-center flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-surface-muted flex items-center justify-center text-muted-foreground/50">
                            <MessageCircle size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground/80">Belum ada sorotan</p>
                            <p className="text-[11px] text-muted-foreground font-medium">Jadilah yang pertama untuk berbagi hari ini.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
          </section>
        </div>

        {/* Kolom Kanan: Quick Actions (Sticky on Desktop) */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground pl-2">Jelajah</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Card className="border-none ring-1 ring-border/50 hover:ring-brand/30 transition-all hover:bg-surface-elevated active:scale-[0.98] cursor-pointer group bg-surface/40 rounded-[20px] shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-2.5 rounded-[14px] ${action.color} group-hover:scale-110 transition-transform shadow-inner`}>
                        <action.icon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-[13px] text-foreground/90">{action.label}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{action.desc}</span>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-muted-foreground/30 group-hover:text-foreground/70 transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Premium Progress / State */}
          <Card className="border-none bg-zinc-950 text-white p-6 rounded-[24px] shadow-2xl relative overflow-hidden group">
            {/* Soft background elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand/20 blur-3xl rounded-full group-hover:bg-brand/30 transition-colors"></div>
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand opacity-90" />
                <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-white/90">Premium Active</h4>
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Nikmati akses lengkap ke seluruh modul perenungan, komunitas, dan fitur analitik rohani Anda.
              </p>
              <Button asChild variant="secondary" className="w-full rounded-full font-black text-[10px] uppercase tracking-widest h-10 bg-white/10 hover:bg-white/20 text-white border-none shadow-none transition-colors">
                <Link href="/profile">Buka Profil</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
