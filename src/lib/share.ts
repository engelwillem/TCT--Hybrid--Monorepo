export function getCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${normalizedPath}`;
  }
  return `https://www.thechoosentalks.org${normalizedPath}`;
}

export function getVerseShareUrl(lang: string, slug: string): string {
  return getCanonicalUrl(`/versehub/${lang}/share/${encodeURIComponent(slug)}`);
}

export function getCommunityShareUrl(postId: string): string {
  return getCanonicalUrl(`/community/posts/${encodeURIComponent(postId)}/share`);
}

export function buildTodayShareText(url: string): string {
  return `Aku menemukan ruang teduh hari ini.\nKalau kamu mau, kamu bisa memulainya dari sini: ${url}`;
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
