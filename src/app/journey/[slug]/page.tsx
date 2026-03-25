import { redirect } from 'next/navigation';

export default async function JourneyDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/paths/${slug}`);
}
