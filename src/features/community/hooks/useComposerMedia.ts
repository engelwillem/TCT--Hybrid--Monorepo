import { useEffect, useMemo, useState } from "react";
import {
  CAROUSEL_RATIO_PRESETS,
  FREE_UPLOAD_RATIO_PRESETS,
  moveItemToIndex,
  type ComposerImage,
  type ComposerMode,
  type MediaAspectRatio,
} from "../components/post-composer/types";

type UpdateMediaCommand =
  | { kind: "remove"; id: string }
  | { kind: "setCover"; id: string }
  | { kind: "move"; id: string; direction: "left" | "right" }
  | { kind: "replaceAll"; images: ComposerImage[] }
  | { kind: "upsert"; image: ComposerImage; existingId?: string };

type UseComposerMediaParams = {
  initialMode?: ComposerMode;
  initialAspectRatio?: MediaAspectRatio;
  maxImages?: number;
};

export function useComposerMedia({
  initialMode = "carousel",
  initialAspectRatio = "4:5",
  maxImages = 5,
}: UseComposerMediaParams = {}) {
  const [composerMode, setComposerMode] = useState<ComposerMode>(initialMode);
  const [mediaAspectRatio, setMediaAspectRatio] = useState<MediaAspectRatio>(initialAspectRatio);
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const availableRatioPresets = composerMode === "carousel" ? CAROUSEL_RATIO_PRESETS : FREE_UPLOAD_RATIO_PRESETS;

  const cropPreset = useMemo(
    () => availableRatioPresets.find((item) => item.value === mediaAspectRatio) ?? availableRatioPresets[1] ?? availableRatioPresets[0],
    [availableRatioPresets, mediaAspectRatio]
  );

  useEffect(() => {
    const next: Record<string, string> = {};
    images.forEach((image) => {
      next[image.id] = URL.createObjectURL(image.file);
    });
    setPreviewUrls(next);

    return () => {
      Object.values(next).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    if (availableRatioPresets.some((preset) => preset.value === mediaAspectRatio)) return;
    setMediaAspectRatio(availableRatioPresets[0]?.value ?? "4:5");
  }, [availableRatioPresets, mediaAspectRatio]);

  const updateMedia = (command: UpdateMediaCommand) => {
    setImages((prev) => {
      if (command.kind === "remove") {
        return prev.filter((image) => image.id !== command.id);
      }

      if (command.kind === "setCover") {
        const fromIndex = prev.findIndex((image) => image.id === command.id);
        return moveItemToIndex(prev, fromIndex, 0);
      }

      if (command.kind === "move") {
        const fromIndex = prev.findIndex((image) => image.id === command.id);
        const toIndex = command.direction === "left" ? fromIndex - 1 : fromIndex + 1;
        return moveItemToIndex(prev, fromIndex, toIndex);
      }

      if (command.kind === "replaceAll") {
        return command.images.slice(0, maxImages);
      }

      if (command.existingId) {
        return prev.map((item) => (item.id === command.existingId ? command.image : item));
      }

      return [...prev, command.image].slice(0, maxImages);
    });
  };

  const resetMedia = () => {
    setComposerMode(initialMode);
    setMediaAspectRatio(initialAspectRatio);
    setImages([]);
  };

  const hasImages = images.length > 0;

  return {
    composerMode,
    mediaAspectRatio,
    images,
    previewUrls,
    availableRatioPresets,
    cropPreset,
    hasImages,
    setComposerMode,
    setMediaAspectRatio,
    updateMedia,
    resetMedia,
  };
}
