"use client";

import { useEffect, useMemo, useState } from "react";
import { getAppAuthUser } from "@/services/app-auth-token";

export type SavedAvatarTransform = {
  x: number;
  y: number;
  scale: number;
};

type AvatarOwner = {
  id?: string | null;
  name?: string | null;
};

export const DEFAULT_SAVED_AVATAR_TRANSFORM: SavedAvatarTransform = {
  x: 0,
  y: 0,
  scale: 1,
};

const PROFILE_AVATAR_REFERENCE_SIZE = 120;

function normalizeTransform(transform?: Partial<SavedAvatarTransform> | null): SavedAvatarTransform {
  const x = Number(transform?.x ?? 0);
  const y = Number(transform?.y ?? 0);
  const scale = Number(transform?.scale ?? 1);
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    scale: Number.isFinite(scale) ? scale : 1,
  };
}

function buildTransformKey(identity?: string | null): string | null {
  const value = String(identity || "").trim().toLowerCase();
  if (!value) return null;
  return `tct.profile.avatarTransform:${value}`;
}

function normalizeAvatarSource(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    // If it's an absolute URL, extract the path and search
    const parsed = new URL(raw);
    const path = `${parsed.pathname}${parsed.search}`;
    // Ensure it starts with / and remove duplicate slashes
    return `/${path.replace(/^\/+/, "")}`.toLowerCase();
  } catch {
    // If it's already a path, just normalize slashes
    return `/${raw.replace(/^\/+/, "")}`.toLowerCase();
  }
}

export function loadSavedAvatarTransform(identity?: string | null): SavedAvatarTransform {
  if (typeof window === "undefined") return DEFAULT_SAVED_AVATAR_TRANSFORM;
  const key = buildTransformKey(identity);
  if (!key) return DEFAULT_SAVED_AVATAR_TRANSFORM;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return DEFAULT_SAVED_AVATAR_TRANSFORM;
    return normalizeTransform(JSON.parse(raw) as Partial<SavedAvatarTransform>);
  } catch {
    return DEFAULT_SAVED_AVATAR_TRANSFORM;
  }
}

export function saveAvatarTransform(identity: string | null | undefined, transform: SavedAvatarTransform): void {
  if (typeof window === "undefined") return;
  const key = buildTransformKey(identity);
  if (!key) return;
  window.localStorage.setItem(key, JSON.stringify(normalizeTransform(transform)));
  window.dispatchEvent(new CustomEvent("tct:avatar-transform-updated", {
    detail: {
      key,
      transform: normalizeTransform(transform),
    },
  }));
}

export function useCurrentUserAvatarStyle(
  avatarSrc?: string | null,
  owner?: AvatarOwner,
  targetSizePx: number = PROFILE_AVATAR_REFERENCE_SIZE,
) {
  const [transform, setTransform] = useState<SavedAvatarTransform>(DEFAULT_SAVED_AVATAR_TRANSFORM);

  const authUser = useMemo(() => getAppAuthUser(), []);
  const identity = authUser?.email || authUser?.id || null;
  const currentAvatar = normalizeAvatarSource(authUser?.avatarUrl || null);
  const targetAvatar = normalizeAvatarSource(avatarSrc || null);
  const authId = String(authUser?.id || "").trim();
  const ownerId = String(owner?.id || "").trim();
  const matchesIdentity = Boolean(authId && ownerId && authId === ownerId);
  const matchesAvatar = Boolean(currentAvatar) && currentAvatar === targetAvatar;
  const shouldApply = Boolean(identity) && (matchesIdentity || matchesAvatar);

  useEffect(() => {
    if (!identity || !shouldApply) {
      setTransform(DEFAULT_SAVED_AVATAR_TRANSFORM);
      return;
    }

    const sync = () => setTransform(loadSavedAvatarTransform(identity));
    sync();
    const handle = () => sync();
    window.addEventListener("storage", handle);
    window.addEventListener("tct:avatar-transform-updated", handle as EventListener);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("tct:avatar-transform-updated", handle as EventListener);
    };
  }, [identity, shouldApply]);

  if (!shouldApply) {
    return {
      style: undefined,
      className: undefined,
    } as const;
  }

  const translateRatio =
    targetSizePx > 0 ? targetSizePx / PROFILE_AVATAR_REFERENCE_SIZE : 1;
  const translateX = transform.x * translateRatio;
  const translateY = transform.y * translateRatio;

  return {
    style: {
      transform: `translate(${translateX}px, ${translateY}px) scale(${transform.scale})`,
      transformOrigin: "center center",
    } as const,
    className: "transition-transform duration-200",
  } as const;
}
