"use client";

import { useMemo } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { hasAppAccessToken } from "@/services/app-auth-token";

export type AuthSessionStatus = "restoring" | "guest" | "authenticated";

export function useAuthSession() {
  const { user, status: firebaseStatus } = useUser();
  const hasToken = hasAppAccessToken();

  const status: AuthSessionStatus = useMemo(() => {
    if (firebaseStatus === "restoring") return "restoring";
    if (firebaseStatus === "authenticated") return "authenticated";
    return hasToken ? "authenticated" : "guest";
  }, [firebaseStatus, hasToken]);

  return {
    status,
    isRestoring: status === "restoring",
    isGuest: status === "guest",
    isAuthenticated: status === "authenticated",
    user,
  } as const;
}

