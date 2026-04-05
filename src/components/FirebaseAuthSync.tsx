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
      const failSync = async () => {
        clearAppAccessToken();
        try {
          await signOut(auth);
        } catch {
          // no-op
        }
      };

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
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 12000);
        const response = await fetch("/api/auth/firebase/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({ idToken }),
        }).finally(() => {
          window.clearTimeout(timeoutId);
        });

        // 3. Handle auth rejection from backend
        if (!response.ok) {
          if (shouldInvalidateLocalSession(response.status) || response.status >= 400) {
            await failSync();
          }
          return;
        }

        const payload = await response.json().catch(() => null);
        const token = payload?.data?.token;
        if (typeof token === "string" && token.length > 0) {
          setAppAccessToken(token, "firebase", "session");
          if (payload?.data?.user) {
            setAppAuthUser({
              id: String(payload.data.user.id ?? ""),
              name: String(payload.data.user.name ?? ""),
              email: String(payload.data.user.email ?? ""),
              avatarUrl: typeof payload.data.user.avatarUrl === "string" ? payload.data.user.avatarUrl : null,
            }, "session");
          }
          return;
        }

        await failSync();
      } catch {
        await failSync();
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
