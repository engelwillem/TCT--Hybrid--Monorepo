"use client";

import { use } from "react";
import { VersehubReaderPage } from "@/features/versehub/pages/VersehubReaderPage";

export default function Page({ params }: { params: Promise<{ lang: string; id: string }> }) {
    const { lang, id } = use(params);
    
    // In the reader page, we handle the ID as the active book/chapter.
    // The VersehubReaderPage component handles its own data fetching based on the URL context.
    return <VersehubReaderPage lang={lang} />;
}
