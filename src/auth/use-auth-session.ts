"use client";

import { useMemo } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { getAppAuthUser, hasAppAccessToken } from "@/services/app-auth-token";

export type AuthSessionStatus = "restoring" | "guest" | "authenticated";

export function useAuthSession() {
  const { user, status: firebaseStatus } = useUser();
  const hasToken = hasAppAccessToken();
  const authUser = getAppAuthUser();

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
    profileName: user?.displayName?.trim() || authUser?.name?.trim() || null,
  } as const;
}
