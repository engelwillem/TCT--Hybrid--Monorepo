import { buildAppAuthHeaders } from "@/lib/app-auth-fetch";
import type { SpiritualState } from "@/app/today/components/sections/StateChips";

function getHeaders() {
  return buildAppAuthHeaders({
    contentType: "application/json",
  });
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
