"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FirebaseAuthSync } from "@/components/FirebaseAuthSync";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AppShell } from "@/layouts/AppShell";
import { requiresAppSession } from "@/lib/app-runtime-paths";

interface ClientAppProvidersProps {
  children: ReactNode;
}

export function ClientAppProviders({ children }: ClientAppProvidersProps) {
  const pathname = usePathname();
  const shouldHydrateAppSession = requiresAppSession(pathname);
  const shell = <AppShell>{children}</AppShell>;

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
