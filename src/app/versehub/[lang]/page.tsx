
"use client";

import { useParams } from "next/navigation";
import { VersehubReaderPage } from "@/features/versehub/pages/VersehubReaderPage";

export default function Page() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang || "id";
  
  return <VersehubReaderPage lang={lang} mode="landing" />;
}
