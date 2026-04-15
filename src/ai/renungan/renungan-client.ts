import type { RenunganApiRequest } from "@/ai/core/normalize";

export async function generateRenungan(request: RenunganApiRequest) {
  const response = await fetch("/api/renungan/personalize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to generate renungan");
  }

  return response.json();
}
