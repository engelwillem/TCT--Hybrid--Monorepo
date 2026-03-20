"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, Compass, Route, Users, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pillars = [
  {
    id: "today",
    icon: Compass,
    title: "Today",
    description: "Masuk dari kondisi hatimu hari ini, bukan dari menu yang membingungkan.",
    href: "/today",
    cta: "Buka Today",
    accent: "from-cyan-100/70 via-sky-100/35 to-transparent",
    iconTone: "bg-cyan-100/80 text-cyan-700",
  },
  {
    id: "versehub",
    icon: BookOpenText,
    title: "VerseHub",
    description: "Baca firman dengan pengalaman reader yang tenang, dalam, dan siap menuntun ke refleksi.",
    href: "/versehub/id",
    cta: "Masuk VerseHub",
    accent: "from-cyan-100/75 via-sky-100/40 to-transparent",
    iconTone: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "paths",
    icon: Route,
    title: "Paths",
    description: "Bangun ritme pertumbuhan lewat perjalanan bertahap yang bisa kamu lanjutkan setiap hari.",
    href: "/paths",
    cta: "Lihat Paths",
    accent: "from-cyan-100/65 via-slate-100/40 to-transparent",
    iconTone: "bg-cyan-100/80 text-cyan-700",
  },
  {
    id: "community",
    icon: Users,
    title: "Community",
    description: "Ubah apa yang kamu baca dan rasakan menjadi doa, kesaksian, atau dukungan yang nyata.",
    href: "/community",
    cta: "Masuk Community",
    accent: "from-cyan-100/70 via-slate-100/35 to-transparent",
    iconTone: "bg-cyan-100/80 text-cyan-700",
  },
];

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-soft backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </span>
  );
}

function PillarCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
  accent,
  iconTone,
}: (typeof pillars)[number]) {
  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-white/70 bg-white/78 p-6 shadow-card backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-premium md:rounded-[40px] md:p-8">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70", accent)} />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="relative flex h-full flex-col justify-between gap-8">
        <div className="space-y-5">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-[20px] ring-1 ring-white/70 shadow-soft", iconTone)}>
            <Icon className="h-6 w-6" />
          </div>

          <div className="space-y-3">
            <h3 className="tct-h2 text-slate-900">{title}</h3>
            <p className="tct-body text-slate-600">{description}</p>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-12 justify-between rounded-full border-white/80 bg-white/75 px-5 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-soft transition-all hover:border-slate-200 hover:bg-white hover:text-slate-950"
        >
          <Link href={href}>
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(165deg,#ebf3fb_0%,#e3ecf8_48%,#e1ebf7_100%)] text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,255,255,0.75),transparent_35%),radial-gradient(circle_at_88%_12%,rgba(187,218,245,0.35),transparent_40%)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 md:px-8 md:py-8">
        <div className="space-y-1">
          <p className="tct-serif text-2xl font-bold tracking-tight text-slate-900">
            TheChosen<span className="tct-brand-gradient">Talks</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Spiritual Companion Web App</p>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-white/80 bg-white/80 px-5 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-soft hover:bg-white hover:text-slate-950"
        >
          <Link href="/login">Masuk</Link>
        </Button>
      </header>

      <main className="relative z-10">
        <section className="mx-auto flex min-h-[78dvh] w-full max-w-6xl items-center px-5 pb-16 pt-8 md:px-8 md:pb-24 md:pt-10">
          <div className="grid w-full gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div className="space-y-8">
              <Badge>
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                Daily Spiritual Home Screen
              </Badge>

              <div className="space-y-5">
                <h1 className="tct-serif text-[42px] font-bold leading-[1.02] tracking-[-0.04em] text-slate-900 md:text-[76px]">
                  Mulai dari
                  <br />
                  keadaan hatimu,
                  <br />
                  lalu ambil langkah
                  <br />
                  berikutnya.
                </h1>
                <p className="max-w-2xl text-base font-medium leading-8 text-slate-600 md:text-xl">
                  TheChosenTalks dirancang bukan sebagai portal konten yang ramai, tetapi sebagai companion harian untuk membaca,
                  merenung, bertumbuh, dan merespons bersama.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-14 rounded-full bg-slate-900 px-7 text-[11px] font-black uppercase tracking-widest text-white shadow-premium hover:bg-slate-800"
                >
                  <Link href="/today">
                    Buka Today
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-white/80 bg-white/80 px-7 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-soft hover:bg-white hover:text-slate-950"
                >
                  <Link href="/versehub/id">Masuk VerseHub</Link>
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-sky-100/70 via-white/70 to-cyan-100/45 blur-3xl" />
              <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-premium backdrop-blur-2xl md:p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="tct-kicker text-brand">One Clear Loop</p>
                    <h2 className="tct-h2 text-slate-900">Today menentukan konteks. VerseHub memperdalam. Community merespons. Paths melanjutkan.</h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Grounding harian yang terasa personal",
                      "Reader Alkitab yang lebih tenang dan imersif",
                      "Refleksi dan doa yang tidak berhenti di satu layar",
                      "Perjalanan bertumbuh yang bisa diulang besok",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[22px] bg-white/78 px-4 py-3 ring-1 ring-slate-100 shadow-soft">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                        <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8 md:pb-24">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div className="space-y-3">
              <Badge className="text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Core Experience
              </Badge>
              <h2 className="tct-serif text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Satu ekosistem, empat permukaan inti.
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
              >
                <PillarCard {...pillar} />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/70 bg-white/55 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 py-16 text-center md:px-8 md:py-20">
            <Badge className="text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
              Calm, Guided, Scripture-Centered
            </Badge>
            <h2 className="tct-serif text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Bukan sekadar banyak fitur.
              <br />
              Satu langkah yang paling penting hari ini.
            </h2>
            <p className="max-w-3xl text-base font-medium leading-8 text-slate-600 md:text-lg">
              Produk ini diarahkan untuk membantu user mengambil keputusan rohani berikutnya dengan tenang: mulai dari kondisi hati,
              membaca firman, menuliskan respons, lalu melanjutkan pertumbuhan.
            </p>
            <Button
              asChild
              className="h-14 rounded-full bg-brand px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-premium hover:brightness-110"
            >
              <Link href="/login">
                Mulai Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <footer className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 text-center md:px-8 md:py-14">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">The Chosen Talks</p>
          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            <Link href="/legal/privacy" className="hover:text-slate-700">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-slate-700">
              Terms
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
