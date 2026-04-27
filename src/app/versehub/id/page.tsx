import { redirect } from "next/navigation";
import { VersehubReaderPage } from "@/features/versehub/pages/VersehubReaderPage";
import { resolveVersehubIdRoute } from "@/features/versehub/utils/versehub-id-route";

type VerseHubIndonesiaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerseHubIndonesiaPage({ searchParams }: VerseHubIndonesiaPageProps) {
  const params = await searchParams;
  const resolution = resolveVersehubIdRoute(params);
  if (resolution.kind === "redirect") {
    redirect(resolution.target);
  }

  return <VersehubReaderPage lang="id" mode="landing" />;
}
