import { COMMUNITY_COMPOSER_TYPES, type CommunityComposerType } from "../../categories";

export type PostType = CommunityComposerType;
export type ComposerMode = "carousel" | "free";
export type MediaAspectRatio = "9:16" | "4:5" | "1:1" | "16:9" | "og" | "auto";
export type ComposerPanel = "none" | "media" | "category";
export type ComposerLifecycleState = "idle" | "expanded" | "typing" | "media-attached" | "submitting";

export type PostComposerMetadata = {
  media_aspect_ratio?: MediaAspectRatio;
  composer_mode?: ComposerMode;
  cover_index?: number;
  media_order?: string[];
  crop_transforms?: Array<{
    id: string;
    x: number;
    y: number;
    scale: number;
    aspect_ratio: MediaAspectRatio;
  }>;
};

export type ComposerSubmitFailureKind =
  | "auth"
  | "validation"
  | "storage"
  | "network"
  | "unknown";

export type ComposerSubmitResult =
  | { ok: true }
  | {
      ok: false;
      kind: ComposerSubmitFailureKind;
      message: string;
      status?: number;
      diagnostics?: Record<string, unknown>;
    };

export type CropTransform = {
  x: number;
  y: number;
  scale: number;
};

export type CropQueueItem = {
  id: string;
  file: File;
  source: string;
  aspectRatio: MediaAspectRatio;
  transform: CropTransform;
  existingId?: string;
};

export type CropImageSize = {
  width: number;
  height: number;
};

export type ComposerImage = {
  id: string;
  file: File;
  aspectRatio: MediaAspectRatio;
  originalFile: File;
  originalSource: string;
  transform: CropTransform;
};

export type RatioPreset = {
  value: MediaAspectRatio;
  label: string;
  ratio: number | null;
};

export type PostComposerTypeOption = {
  value: PostType;
  label: string;
};

export const POST_COMPOSER_TYPES: PostComposerTypeOption[] = COMMUNITY_COMPOSER_TYPES;

export const CAROUSEL_RATIO_PRESETS: RatioPreset[] = [
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
  { value: "4:5", label: "4:5", ratio: 4 / 5 },
  { value: "1:1", label: "1:1", ratio: 1 },
];

export const FREE_UPLOAD_RATIO_PRESETS: RatioPreset[] = [
  ...CAROUSEL_RATIO_PRESETS,
  { value: "auto", label: "Original", ratio: null },
  { value: "og", label: "1.9:1", ratio: 1.91 / 1 },
];

export const DEFAULT_CROP_TRANSFORM: CropTransform = { x: 0, y: 0, scale: 1 };
export const MAX_COMPOSER_IMAGES = 5;

export function clampCropTransform(
  transform: CropTransform,
  preview: { width: number; height: number } | null,
  viewport: { width: number; height: number }
): CropTransform {
  if (!preview) return transform;

  const scaledWidth = preview.width * transform.scale;
  const scaledHeight = preview.height * transform.scale;
  const maxOffsetX = Math.max(0, (scaledWidth - viewport.width) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - viewport.height) / 2);

  return {
    ...transform,
    x: Math.min(maxOffsetX, Math.max(-maxOffsetX, transform.x)),
    y: Math.min(maxOffsetY, Math.max(-maxOffsetY, transform.y)),
  };
}

export function resolveFillScale(
  preview: { width: number; height: number } | null,
  viewport: { width: number; height: number }
): number {
  if (!preview) return 1;
  const fillScaleX = viewport.width / preview.width;
  const fillScaleY = viewport.height / preview.height;
  return Math.max(1, fillScaleX, fillScaleY);
}

export function aspectRatioClass(value: MediaAspectRatio): string {
  switch (value) {
    case "9:16":
      return "aspect-[9/16]";
    case "4:5":
      return "aspect-[4/5]";
    case "1:1":
      return "aspect-square";
    case "16:9":
      return "aspect-video";
    case "og":
      return "aspect-[1.91/1]";
    default:
      return "aspect-[1.08/1]";
  }
}

export function moveItemToIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Gagal membaca gambar."));
    reader.readAsDataURL(file);
  });
}

export function buildImageId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}
