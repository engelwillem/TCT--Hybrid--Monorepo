import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parseRenunganShareToken } from "@/lib/renungan-share";
import { getPrimarySiteUrl } from "@/lib/seo";
import { fetchRenunganShareSnapshot } from "@/lib/share-content";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const snapshot = await fetchRenunganShareSnapshot(token);
  const payload =
    snapshot
      ? {
          verseReference: snapshot.verse_reference,
          verseText: snapshot.verse_text,
          meditationExcerpt: snapshot.meditation_excerpt,
          theme: snapshot.theme ?? undefined,
        }
      : parseRenunganShareToken(token);
  const sharePath = `/renungan/share/${token}`;
  const imageUrl = `/api/og/renungan/${token}`;
  const siteUrl = getPrimarySiteUrl();

  if (!payload) {
    return {
      title: "Personal Reflection",
      description: "Reflection from The Chosen Talks.",
      alternates: { canonical: sharePath },
      openGraph: {
        title: "Personal Reflection",
        description: "Reflection from The Chosen Talks.",
        url: `${siteUrl}${sharePath}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: "Personal Reflection" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Personal Reflection",
        description: "Reflection from The Chosen Talks.",
        images: [imageUrl],
      },
    };
  }

  return {
    title: `${payload.verseReference} · Reflection`,
    description: payload.meditationExcerpt,
    alternates: { canonical: sharePath },
    openGraph: {
      title: `${payload.verseReference} · Reflection`,
      description: payload.meditationExcerpt,
      url: `${siteUrl}${sharePath}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: payload.verseReference }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${payload.verseReference} · Reflection`,
      description: payload.meditationExcerpt,
      images: [imageUrl],
    },
  };
}

export default async function RenunganSharePage({ params }: PageProps) {
  const { token } = await params;
  const snapshot = await fetchRenunganShareSnapshot(token);
  const payload =
    snapshot
      ? {
          verseReference: snapshot.verse_reference,
          verseText: snapshot.verse_text,
          meditationExcerpt: snapshot.meditation_excerpt,
          theme: snapshot.theme ?? undefined,
        }
      : parseRenunganShareToken(token);
  if (!payload) notFound();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-[32px] border border-border/50 bg-background/90 p-6 shadow-soft">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          Reflection Share
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">{payload.verseReference}</h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground/80">"{payload.verseText}"</p>
        <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">{payload.meditationExcerpt}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/renungan"
            className="rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background"
          >
            Open Reflection
          </Link>
        </div>
      </div>
    </div>
  );
}
