import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildCommunitySharePayload, fetchCommunitySharePost } from '@/lib/share-content';
import { getPrimarySiteUrl } from '@/lib/seo';

type PageProps = {
  params: Promise<{ postId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchCommunitySharePost(postId);
  const siteUrl = getPrimarySiteUrl();
  const sharePath = `/community/posts/${postId}/share`;
  const imageUrl = `/api/og/community/${postId}`;

  if (!post) {
    return {
      title: 'Community Share',
      description: 'Bagikan cerita, doa, dan refleksi bersama The Chosen Talks.',
      alternates: { canonical: sharePath },
      openGraph: {
        title: 'Community Share',
        description: 'Bagikan cerita, doa, dan refleksi bersama The Chosen Talks.',
        url: `${siteUrl}${sharePath}`,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: 'Community Share' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Community Share',
        description: 'Bagikan cerita, doa, dan refleksi bersama The Chosen Talks.',
        images: [imageUrl],
      },
    };
  }

  const payload = buildCommunitySharePayload(post);

  return {
    title: `${payload.title} • Community`,
    description: payload.body,
    alternates: { canonical: sharePath },
    openGraph: {
      type: 'article',
      title: `${payload.title} • Community`,
      description: payload.body,
      url: `${siteUrl}${sharePath}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: payload.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${payload.title} • Community`,
      description: payload.body,
      images: [imageUrl],
    },
  };
}

export default async function CommunitySharePage({ params }: PageProps) {
  const { postId } = await params;
  const post = await fetchCommunitySharePost(postId);
  if (!post) notFound();

  const payload = buildCommunitySharePayload(post);
  const previewImage = payload.imageUrl;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="overflow-hidden rounded-[32px] border border-border/50 bg-background/90 shadow-soft">
        {previewImage ? (
          <div className="aspect-[1.91/1] w-full overflow-hidden bg-surface-muted">
            <img src={previewImage} alt={payload.title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            Community Share
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">{payload.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">{payload.body}</p>
          <p className="mt-4 text-sm font-semibold text-muted-foreground">{payload.meta}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/community"
              className="rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background"
            >
              Buka Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
