"use client";

import { useEffect } from "react";
import { getApps } from "firebase/app";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { clearAppAccessToken, setAppAccessToken } from "@/services/app-auth-token";

export function FirebaseAuthSync() {
  useEffect(() => {
    if (getApps().length === 0) return;

    const auth = getAuth(getApps()[0]);
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        clearAppAccessToken();
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch("/api/auth/firebase/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403 || response.status === 422) {
            clearAppAccessToken();
          }
          return;
        }

        const payload = await response.json().catch(() => null);
        const token = payload?.data?.token;
        if (typeof token === "string" && token.length > 0) {
          setAppAccessToken(token);
          return;
        }

        clearAppAccessToken();
      } catch {
        // Keep the previous token when the backend is temporarily unreachable.
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
