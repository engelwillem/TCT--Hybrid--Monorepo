import { buildAppAuthHeaders } from "@/lib/app-auth-fetch";

function getLang() {
  return typeof window !== 'undefined' ? (localStorage.getItem('tct_lang') || 'id') : 'id';
}

function getHeaders() {
  return buildAppAuthHeaders({
    contentType: "application/json",
  });
}

export async function getStudyPaths() {
  const lang = getLang();
  const res = await fetch(`/api/study-paths/${lang}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch paths");
  return res.json();
}

export async function getStudyPathDetail(slug: string) {
  const lang = getLang();
  const res = await fetch(`/api/study-paths/${lang}/${slug}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch path detail");
  return res.json();
}

export async function completeStudyPathStep(slug: string, stepId: number | string) {
  const lang = getLang();
  const res = await fetch(`/api/study-paths/${lang}/${slug}/complete/${stepId}`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to complete step");
  return res.json();
}
