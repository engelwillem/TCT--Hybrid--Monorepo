import { cookies } from "next/headers";
import { callLaravelApi } from "@/lib/laravel-api";

const APP_SESSION_COOKIE = "tct_app_session";
const ADMIN_EMAIL = "engel.willem@gmail.com";

type SessionGuardResult = {
  authenticated: boolean;
  isAdmin: boolean;
  email: string | null;
};

function isLikelySanctumToken(token: string): boolean {
  return /^\d+\|[A-Za-z0-9]+$/.test(token);
}

export async function resolveServerRouteSession(): Promise<SessionGuardResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(APP_SESSION_COOKIE)?.value?.trim() ?? "";

  if (!token || !isLikelySanctumToken(token)) {
    return {
      authenticated: false,
      isAdmin: false,
      email: null,
    };
  }

  try {
    const response = await callLaravelApi("/api/v1/profile", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        authenticated: false,
        isAdmin: false,
        email: null,
      };
    }

    const payload = (await response.json().catch(() => null)) as {
      data?: {
        user?: {
          email?: string;
          is_admin?: boolean;
        };
      };
    } | null;

    const email = String(payload?.data?.user?.email || "").trim().toLowerCase();
    const isAdmin = Boolean(payload?.data?.user?.is_admin) && email === ADMIN_EMAIL;

    return {
      authenticated: true,
      isAdmin,
      email: email || null,
    };
  } catch {
    return {
      authenticated: false,
      isAdmin: false,
      email: null,
    };
  }
}

