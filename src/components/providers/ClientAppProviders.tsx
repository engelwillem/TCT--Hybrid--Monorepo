"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FirebaseAuthSync } from "@/components/FirebaseAuthSync";
import { DataMutationAutoRefresh } from "@/components/DataMutationAutoRefresh";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AppShell } from "@/layouts/AppShell";
import { requiresAppSession } from "@/lib/app-runtime-paths";

interface ClientAppProvidersProps {
  children: ReactNode;
}

export function ClientAppProviders({ children }: ClientAppProvidersProps) {
  const pathname = usePathname();
  const shouldHydrateAppSession = requiresAppSession(pathname);

  // Standalone pages that should NOT use AppShell
  const standalonePaths = ['/seneco-n8n-test-willem'];
  const isStandalone = standalonePaths.some(path => pathname?.startsWith(path));

  if (isStandalone) {
    return (
      <>
        <DataMutationAutoRefresh />
        {children}
      </>
    );
  }

  const shell = (
    <>
      <DataMutationAutoRefresh />
      <AppShell>{children}</AppShell>
    </>
  );

  if (!shouldHydrateAppSession) {
    return shell;
  }

  return (
    <FirebaseClientProvider>
      <FirebaseAuthSync />
      {shell}
    </FirebaseClientProvider>
  );
}
