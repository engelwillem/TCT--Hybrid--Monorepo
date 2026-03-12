
"use client";

import { use } from "react";
import { VersehubReaderPage } from "@/features/versehub/pages/VersehubReaderPage";

export default function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  
  return <VersehubReaderPage lang={lang} mode="landing" />;
}
