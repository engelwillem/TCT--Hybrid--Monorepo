import { resolveAdminOrigin, resolveApiOrigin, resolveWebOrigin } from "@/lib/origin";

export type AvatarTransform = {
  x: number;
  y: number;
  scale: number;
};

export type AvatarImageSize = {
  width: number;
  height: number;
};

export const DEFAULT_AVATAR_TRANSFORM: AvatarTransform = {
  x: 0,
  y: 0,
  scale: 1,
};

export const AVATAR_TRANSFORM_LIMIT = {
  offset: 42,
  minScale: 1,
  maxScale: 1.6,
};

export const AVATAR_EDITOR_VIEWPORT = 280;
export const AVATAR_EDITOR_LIMIT = {
  offset: 180,
  minScale: 1,
  maxScale: 3,
};

export function dedupeCandidates(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const value = String(raw || "").trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

export function buildAvatarCandidates(rawUrl: string | null | undefined): string[] {
  const candidate = String(rawUrl || "").trim();
  if (!candidate) return [];

  if (candidate.startsWith("data:image/")) {
    return [candidate];
  }

  const apiBase = resolveApiOrigin();
  const webBase = resolveWebOrigin();
  const adminBase = resolveAdminOrigin();

  try {
    const url = new URL(candidate);
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (!url.pathname.startsWith("/storage/")) {
      return [url.toString()];
    }
    return dedupeCandidates([
      new URL(path, apiBase).toString(),
      new URL(path, webBase).toString(),
      new URL(path, adminBase).toString(),
      url.toString(),
    ]);
  } catch {
    const path = candidate.startsWith("/") ? candidate : `/${candidate.replace(/^\/+/, "")}`;
    const withApi = (() => {
      try {
        return new URL(path, apiBase).toString();
      } catch {
        return null;
      }
    })();
    const withWeb = (() => {
      try {
        return new URL(path, webBase).toString();
      } catch {
        return null;
      }
    })();
    const withAdmin = (() => {
      try {
        return new URL(path, adminBase).toString();
      } catch {
        return null;
      }
    })();
    return dedupeCandidates([withApi, withWeb, withAdmin, path]);
  }
}

function canRenderAvatarImmediately(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("data:image/");
}

function probeAvatarImage(url: string, timeoutMs = 6000): Promise<boolean> {
  if (canRenderAvatarImmediately(url)) return Promise.resolve(true);

  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };

    const timer = window.setTimeout(() => done(false), timeoutMs);
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = url;
  });
}

export async function pickRenderableAvatarCandidate(candidates: string[]): Promise<string | null> {
  const deduped = dedupeCandidates(candidates);
  for (const candidate of deduped) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await probeAvatarImage(candidate);
    if (ok) return candidate;
  }
  return null;
}

export function getInitials(rawName: string): string {
  const parts = String(rawName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function clampTransform(next: AvatarTransform): AvatarTransform {
  const offset = AVATAR_TRANSFORM_LIMIT.offset;
  const minScale = AVATAR_TRANSFORM_LIMIT.minScale;
  const maxScale = AVATAR_TRANSFORM_LIMIT.maxScale;
  return {
    x: Math.max(-offset, Math.min(offset, Number(next.x) || 0)),
    y: Math.max(-offset, Math.min(offset, Number(next.y) || 0)),
    scale: Math.max(minScale, Math.min(maxScale, Number(next.scale) || 1)),
  };
}

export function clampEditorTransform(next: AvatarTransform): AvatarTransform {
  const offset = AVATAR_EDITOR_LIMIT.offset;
  return {
    x: Math.max(-offset, Math.min(offset, Number(next.x) || 0)),
    y: Math.max(-offset, Math.min(offset, Number(next.y) || 0)),
    scale: Math.max(AVATAR_EDITOR_LIMIT.minScale, Math.min(AVATAR_EDITOR_LIMIT.maxScale, Number(next.scale) || 1)),
  };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function loadImageDimensions(source: string): Promise<AvatarImageSize> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    img.onerror = () => reject(new Error("Failed to load image dimensions."));
    img.src = source;
  });
}

export async function cropAvatarFile(
  source: string,
  fileName: string,
  transform: AvatarTransform,
  imageSize?: AvatarImageSize | null,
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for cropping."));
    img.src = source;
  });

  const outputSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas crop is not available.");

  const naturalWidth = imageSize?.width || image.naturalWidth;
  const naturalHeight = imageSize?.height || image.naturalHeight;
  const containScale = Math.min(outputSize / naturalWidth, outputSize / naturalHeight);
  const finalScale = containScale * transform.scale;
  const drawWidth = naturalWidth * finalScale;
  const drawHeight = naturalHeight * finalScale;
  const movementRatio = outputSize / AVATAR_EDITOR_VIEWPORT;
  const drawX = (outputSize - drawWidth) / 2 + transform.x * movementRatio;
  const drawY = (outputSize - drawHeight) / 2 + transform.y * movementRatio;

  ctx.clearRect(0, 0, outputSize, outputSize);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) throw new Error("Failed to create avatar crop result.");

  const safeBaseName = fileName.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${safeBaseName}-avatar.jpg`, { type: "image/jpeg" });
}
