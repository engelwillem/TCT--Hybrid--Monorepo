
"use client";

import { VersehubReaderPage } from "@/features/versehub/pages/VersehubReaderPage";

export default function Page({ params }: { params: { lang: string } }) {
  const { lang } = params;
  
  return <VersehubReaderPage lang={lang} mode="landing" />;
}
