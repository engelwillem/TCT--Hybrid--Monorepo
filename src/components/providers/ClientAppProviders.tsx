"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FirebaseAuthSync } from "@/components/FirebaseAuthSync";
import { DataMutationAutoRefresh } from "@/components/DataMutationAutoRefresh";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AppShell } from "@/layouts/AppShell";
import { requiresAppSession } from "@/lib/app-runtime-paths";

import { SanctuaryProvider } from "@/features/sanctuary/components/SanctuaryContext";

interface ClientAppProvidersProps {
  children: ReactNode;
}

export function ClientAppProviders({ children }: ClientAppProvidersProps) {
  const pathname = usePathname();
  const shouldHydrateAppSession = requiresAppSession(pathname);
  const shell = (
    <SanctuaryProvider>
      <DataMutationAutoRefresh />
      <AppShell>{children}</AppShell>
    </SanctuaryProvider>
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
