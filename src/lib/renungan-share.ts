export type RenunganSharePayload = {
  verseReference: string;
  verseText: string;
  meditationExcerpt: string;
  theme?: string;
};

function toUrlSafeBase64(input: string): string {
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(input, "utf-8").toString("base64")
      : (() => {
          const bytes = new TextEncoder().encode(input);
          let binary = "";
          bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
          });
          return btoa(binary);
        })();
  return encoded
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromUrlSafeBase64(input: string): string | null {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(`${normalized}${padding}`, "base64").toString("utf-8");
    }
    const binary = atob(`${normalized}${padding}`);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function cleanLine(value: string, max = 220): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}...`;
}

export function createRenunganShareToken(payload: RenunganSharePayload): string {
  const safePayload: RenunganSharePayload = {
    verseReference: cleanLine(payload.verseReference, 80),
    verseText: cleanLine(payload.verseText, 320),
    meditationExcerpt: cleanLine(payload.meditationExcerpt, 260),
    theme: payload.theme ? cleanLine(payload.theme, 48) : undefined,
  };
  return toUrlSafeBase64(JSON.stringify(safePayload));
}

export function parseRenunganShareToken(token: string): RenunganSharePayload | null {
  const decoded = fromUrlSafeBase64(token);
  if (!decoded) return null;

  try {
    const parsed = JSON.parse(decoded) as Partial<RenunganSharePayload>;
    const verseReference = cleanLine(String(parsed.verseReference || ""), 80);
    const verseText = cleanLine(String(parsed.verseText || ""), 320);
    const meditationExcerpt = cleanLine(String(parsed.meditationExcerpt || ""), 260);
    const theme = parsed.theme ? cleanLine(String(parsed.theme), 48) : undefined;

    if (!verseReference || !verseText || !meditationExcerpt) return null;

    return {
      verseReference,
      verseText,
      meditationExcerpt,
      theme,
    };
  } catch {
    return null;
  }
}
