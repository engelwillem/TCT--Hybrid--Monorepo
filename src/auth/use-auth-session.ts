"use client";

import { useMemo } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { getAppAuthUser, hasAppAccessToken } from "@/services/app-auth-token";

export type AuthSessionStatus = "restoring" | "guest" | "authenticated";

function buildInitial(name: string | null | undefined, fallback: string): string {
  const trimmed = String(name || "").trim();
  if (!trimmed) return fallback;
  const firstLetter = trimmed.match(/\p{L}/u)?.[0];
  return firstLetter ? firstLetter.toUpperCase() : fallback;
}

function deriveDisplayName(name: string | null, email: string | null): string | null {
  if (name) return name;
  const emailLocalPart = String(email || "").split("@")[0]?.trim() || "";
  return emailLocalPart || null;
}

export function useAuthSession() {
  const { user, status: firebaseStatus } = useUser();
  const hasToken = hasAppAccessToken();
  const authUser = getAppAuthUser();
  const hasAuthenticatedFirebaseUser = firebaseStatus === "authenticated" && !user?.isAnonymous;

  const status: AuthSessionStatus = useMemo(() => {
    if (firebaseStatus === "restoring") return "restoring";
    if (hasAuthenticatedFirebaseUser) return "authenticated";
    return hasToken ? "authenticated" : "guest";
  }, [firebaseStatus, hasAuthenticatedFirebaseUser, hasToken]);

  const profileName = user?.displayName?.trim() || authUser?.name?.trim() || null;
  const profileEmail = user?.email?.trim() || authUser?.email?.trim() || null;
  const avatarUrl = user?.photoURL?.trim() || authUser?.avatarUrl?.trim() || null;
  const displayName = deriveDisplayName(profileName, profileEmail);

  const identity = useMemo(() => {
    if (status === "authenticated") {
      const name = displayName || "Member";
      return {
        name,
        email: profileEmail || "",
        avatarUrl,
        initial: buildInitial(name, "M"),
        isGuest: false,
      } as const;
    }

    return {
      name: "Guest",
      email: "",
      avatarUrl: null,
      initial: "G",
      isGuest: true,
    } as const;
  }, [status, displayName, profileEmail, avatarUrl]);

  return {
    status,
    isRestoring: status === "restoring",
    isGuest: status === "guest",
    isAuthenticated: status === "authenticated",
    user,
    profileName,
    profileEmail,
    avatarUrl,
    identity,
  } as const;
}
