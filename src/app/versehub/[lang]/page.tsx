
import { VersehubReaderPage } from "@/features/versehub/pages/VersehubReaderPage";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang = "id" } = await params;

  return <VersehubReaderPage lang={lang} mode="landing" />;
}
