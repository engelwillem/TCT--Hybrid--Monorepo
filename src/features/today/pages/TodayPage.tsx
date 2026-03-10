"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Quote, 
  BookOpen, 
  Hash, 
  Inbox, 
  PlusCircle, 
  ChevronRight,
  Heart,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { MOCK_POSTS } from "@/features/community/mock";
import { motion } from "framer-motion";

export function TodayPage() {
  const highlights = MOCK_POSTS.slice(0, 4);

  const quickActions = [
    { label: "Post", icon: PlusCircle, href: "/community", color: "bg-blue-500/10 text-blue-600", desc: "Bagikan inspirasi" },
    { label: "Read", icon: BookOpen, href: "/versehub/en", color: "bg-green-500/10 text-green-600", desc: "Baca firman" },
    { label: "Channels", icon: Hash, href: "/channels", color: "bg-purple-500/10 text-purple-600", desc: "Diskusi grup" },
    { label: "Inbox", icon: Inbox, href: "/inbox", color: "bg-orange-500/10 text-orange-600", desc: "Pesan masuk" },
  ];

  const currentDate = new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="flex flex-col h-full bg-transparent animate-in fade-in duration-500 space-y-8 md:py-10">
      {/* Header Responsif */}
      <header className="px-6 md:px-0 space-y-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="tct-h1">Selamat Pagi, <span className="text-brand">Chosen</span></h2>
            <p className="text-muted-foreground font-medium">Inspirasi harian Anda sudah siap untuk hari ini.</p>
          </div>
          <Badge variant="secondary" className="w-fit bg-brand/10 text-brand border-none h-8 px-4 rounded-full font-black text-xs uppercase tracking-widest">
            {currentDate}
          </Badge>
        </div>
      </header>

      {/* Grid Layout Utama untuk Web */}
      <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Kolom Kiri: Ayat & Highlights */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Daily Verse Section */}
          <section className="section-container">
            <div className="flex items-center gap-2 text-brand pl-1">
              <Sparkles size={18} className="animate-pulse" />
              <h3 className="tct-label">Ayat Hari Ini</h3>
            </div>
            <Card className="relative bg-gradient-to-br from-brand/10 via-background to-accent/5 border-brand/10 shadow-xl shadow-brand/5 overflow-hidden group border-2">
              <Quote size={120} className="absolute -right-4 -bottom-4 text-brand/5 rotate-12" />
              <CardContent className="p-8 md:p-12 text-center space-y-6 relative z-10">
                <p className="italic text-xl md:text-2xl font-semibold text-foreground/90 leading-relaxed max-w-2xl mx-auto">
                  &quot;Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.&quot;
                </p>
                <div className="space-y-4">
                  <p className="text-brand font-black text-base tracking-widest uppercase">— Yeremia 29:11</p>
                  <Button asChild size="lg" className="rounded-full shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all">
                    <Link href="/versehub/id">Buka VerseHub</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Community Highlights - Grid on Desktop */}
          <section className="section-container">
            <div className="flex items-center justify-between pl-1">
              <h3 className="tct-label">Sorotan Komunitas</h3>
              <Link href="/community" className="text-[10px] font-black text-brand uppercase flex items-center gap-1 hover:underline">
                Lihat Semua <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlights.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href="/community">
                    <Card className="border-none ring-1 ring-border/50 hover:ring-brand/30 transition-all active:scale-[0.98] h-full bg-card/60 backdrop-blur-sm">
                      <CardContent className="p-5 flex gap-4">
                        <Avatar className="w-12 h-12 border-2 border-background shadow-md shrink-0">
                          <AvatarImage src={post.author.avatarUrl} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-extrabold truncate">{post.author.name}</p>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase">{post.createdAt}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                            {post.text || (post.imageUrl ? "Membagikan foto baru..." : "")}
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black">
                              <Heart size={12} className="text-red-500 fill-current" /> {post.counts.likes}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black">
                              <MessageCircle size={12} /> {post.counts.comments}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Quick Actions (Sticky on Desktop) */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
          <section className="section-container">
            <h3 className="tct-label pl-1">Akses Cepat</h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Card className="border-none ring-1 ring-border/50 hover:ring-brand/30 transition-all hover:bg-muted/30 active:scale-95 cursor-pointer group">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${action.color} group-hover:scale-110 transition-transform shadow-sm`}>
                        <action.icon size={22} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm">{action.label}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{action.desc}</span>
                      </div>
                      <ChevronRight size={16} className="ml-auto text-muted-foreground/30 group-hover:text-brand transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Stats atau Information Card Tambahan */}
          <Card className="border-none bg-brand text-brand-foreground p-6 rounded-3xl shadow-xl shadow-brand/20">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h4 className="font-black text-sm uppercase tracking-widest">Premium Active</h4>
              </div>
              <p className="text-xs opacity-90 leading-relaxed font-medium">
                Anda memiliki akses penuh ke semua fitur eksklusif VerseHub dan Channels. Selamat bertumbuh!
              </p>
              <Button variant="secondary" className="w-full rounded-full font-black text-xs h-10 bg-white text-brand hover:bg-white/90">
                LIHAT PROGRES
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}