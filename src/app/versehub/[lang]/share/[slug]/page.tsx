import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPrimarySiteUrl } from '@/lib/seo';
import { fetchVerseShareData } from '@/lib/share-content';

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const verse = await fetchVerseShareData(lang, slug);
  const siteUrl = getPrimarySiteUrl();
  const sharePath = `/versehub/${lang}/share/${slug}`;
  const imageUrl = `/api/og/versehub/${lang}/${slug}`;

  if (!verse) {
    return {
      title: 'VerseHub Share',
      description: 'Firman yang dibagikan dari The Chosen Talks.',
      alternates: { canonical: sharePath },
      openGraph: {
        title: 'VerseHub Share',
        description: 'Firman yang dibagikan dari The Chosen Talks.',
        url: `${siteUrl}${sharePath}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: 'VerseHub Share' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'VerseHub Share',
        description: 'Firman yang dibagikan dari The Chosen Talks.',
        images: [imageUrl],
      },
    };
  }

  return {
    title: `${verse.reference} • VerseHub`,
    description: verse.text,
    alternates: { canonical: sharePath },
    openGraph: {
      type: 'article',
      title: `${verse.reference} • VerseHub`,
      description: verse.text,
      url: `${siteUrl}${sharePath}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: verse.reference }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${verse.reference} • VerseHub`,
      description: verse.text,
      images: [imageUrl],
    },
  };
}

export default async function VerseSharePage({ params }: PageProps) {
  const { lang, slug } = await params;
  const verse = await fetchVerseShareData(lang, slug);
  if (!verse) notFound();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-[32px] border border-border/50 bg-background/90 p-6 shadow-soft">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          VerseHub Share
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">{verse.reference}</h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground/80">"{verse.text}"</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/versehub/${lang}/${slug}`}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background"
          >
            Buka ayat ini
          </Link>
          <Link
            href={`/versehub/${lang}`}
            className="rounded-full border border-border/60 px-5 py-3 text-sm font-bold text-foreground"
          >
            Kembali ke VerseHub
          </Link>
        </div>
      </div>
    </div>
  );
}
