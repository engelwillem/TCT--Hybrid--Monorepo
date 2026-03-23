"use client";

import { useEffect } from "react";
import { getApps } from "firebase/app";
import { getAuth, onIdTokenChanged, signOut } from "firebase/auth";
import { clearAppAccessToken, getAppAccessToken, getAppAuthSource, setAppAccessToken, setAppAuthUser, shouldInvalidateLocalSession } from "@/services/app-auth-token";

export function FirebaseAuthSync() {
  useEffect(() => {
    if (getApps().length === 0) return;

    const auth = getAuth(getApps()[0]);
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      // 1. If Firebase says user is logged out
      if (!user) {
        if (typeof window !== "undefined" && window.localStorage.getItem('e2e_bypass_token')) {
          return;
        }

        // Important: do not revoke non-Firebase sessions (e.g. email/password login).
        // Otherwise a valid Laravel token gets wiped and user falls back to guest.
        const source = getAppAuthSource();
        if (source !== "firebase") {
          return;
        }

        const currentToken = getAppAccessToken();
        if (currentToken) {
          // Tell Laravel to revoke token before clearing local state
          try {
            await fetch("/api/auth/logout", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            });
          } catch {
            // Silently fail if backend unreachable during logout
          }
        }
        clearAppAccessToken();
        return;
      }

      // 2. If Firebase user exists, ensure sync
      try {
        const idToken = await user.getIdToken();
        const response = await fetch("/api/auth/firebase/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        // 3. Handle auth rejection from backend
        if (!response.ok) {
          if (shouldInvalidateLocalSession(response.status)) {
            // If backend rejects identity, force client logout
            clearAppAccessToken();
            await signOut(auth);
          }
          return;
        }

        const payload = await response.json().catch(() => null);
        const token = payload?.data?.token;
        if (typeof token === "string" && token.length > 0) {
          setAppAccessToken(token, "firebase");
          if (payload?.data?.user) {
            setAppAuthUser({
              id: String(payload.data.user.id ?? ""),
              name: String(payload.data.user.name ?? ""),
              email: String(payload.data.user.email ?? ""),
              avatarUrl: typeof payload.data.user.avatarUrl === "string" ? payload.data.user.avatarUrl : null,
            });
          }
          return;
        }

        // Keep the previous token if the sync payload is malformed.
        // A broken refresh response should not feel like an instant logout.
      } catch {
        // Keep the previous token when the backend is temporarily unreachable.
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
