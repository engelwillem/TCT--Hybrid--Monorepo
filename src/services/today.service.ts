import { getAppAccessToken } from "./app-auth-token";
import type { SpiritualState } from "@/app/today/components/sections/StateChips";

function getHeaders() {
  const token = getAppAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function submitSpiritualState(state: SpiritualState): Promise<void> {
  const res = await fetch("/api/today/state", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ state }),
  });
  
  if (!res.ok) {
    throw new Error("Failed to update spiritual state.");
  }
}
