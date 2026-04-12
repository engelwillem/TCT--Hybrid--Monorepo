import { useEffect, useMemo, useState } from "react";
import {
  buildImageId,
  CAROUSEL_RATIO_PRESETS,
  clampCropTransform,
  DEFAULT_CROP_TRANSFORM,
  FREE_UPLOAD_RATIO_PRESETS,
  MAX_COMPOSER_IMAGES,
  moveItemToIndex,
  POST_COMPOSER_TYPES,
  readFileAsDataUrl,
  resolveFillScale,
  type ComposerImage,
  type ComposerLifecycleState,
  type ComposerMode,
  type ComposerPanel,
  type CropImageSize,
  type CropQueueItem,
  type CropTransform,
  type MediaAspectRatio,
  type PostComposerMetadata,
  type PostType,
} from "./types";

type UsePostComposerStateParams = {
  onPost: (text: string, type: PostType, images?: File[], metadata?: PostComposerMetadata) => Promise<boolean | void> | boolean | void;
  initialText: string;
  initialType: PostType;
  initialExpanded: boolean;
};

export function usePostComposerState({ onPost, initialText, initialType, initialExpanded }: UsePostComposerStateParams) {
  const [text, setText] = useState(initialText);
  const [type, setType] = useState<PostType>(initialType);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [composerMode, setComposerMode] = useState<ComposerMode>("carousel");
  const [activePanel, setActivePanel] = useState<ComposerPanel>("none");
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [mediaAspectRatio, setMediaAspectRatio] = useState<MediaAspectRatio>("4:5");
  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
  const [activeCropItem, setActiveCropItem] = useState<CropQueueItem | null>(null);
  const [cropTransform, setCropTransform] = useState<CropTransform>(DEFAULT_CROP_TRANSFORM);
  const [cropImageSize, setCropImageSize] = useState<CropImageSize | null>(null);
  const [cropBusy, setCropBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const types = POST_COMPOSER_TYPES;
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

  useEffect(() => {
    if (activeCropItem || cropQueue.length === 0) return;
    const [next, ...rest] = cropQueue;
    setActiveCropItem(next);
    setCropQueue(rest);
    setCropTransform(next.transform);
    setCropImageSize(null);
    if (composerMode === "free") {
      setMediaAspectRatio(next.aspectRatio);
    }
  }, [activeCropItem, composerMode, cropQueue]);

  useEffect(() => {
    if (!activeCropItem) {
      setCropImageSize(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setCropImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      if (!cancelled) setCropImageSize(null);
    };
    image.src = activeCropItem.source;

    return () => {
      cancelled = true;
    };
  }, [activeCropItem]);

  const cropViewport = useMemo(() => {
    const maxWidth = 320;
    const maxHeight = 420;
    if (!cropPreset?.ratio) {
      return { width: maxWidth, height: 320 };
    }

    const ratio = cropPreset.ratio;
    const widthByHeight = maxHeight * ratio;
    if (widthByHeight <= maxWidth) {
      return { width: widthByHeight, height: maxHeight };
    }

    return { width: maxWidth, height: maxWidth / ratio };
  }, [cropPreset]);

  const cropPreviewMetrics = useMemo(() => {
    if (!cropImageSize) return null;
    const containScale = Math.min(cropViewport.width / cropImageSize.width, cropViewport.height / cropImageSize.height);
    return {
      width: cropImageSize.width * containScale,
      height: cropImageSize.height * containScale,
    };
  }, [cropImageSize, cropViewport.height, cropViewport.width]);

  const hasImages = images.length > 0;
  const selectedTypeLabel = types.find((item) => item.value === type)?.label ?? "Curahan Hati";
  const canSubmit = Boolean(text.trim() || hasImages);
  const state: ComposerLifecycleState = isSubmitting
    ? "submitting"
    : hasImages
      ? "media-attached"
      : text.trim()
        ? "typing"
        : isExpanded
          ? "expanded"
          : "idle";

  const resetComposer = () => {
    setIsExpanded(false);
    setActivePanel("none");
    setText("");
    setImages([]);
    setCropQueue([]);
    setActiveCropItem(null);
    setCropTransform(DEFAULT_CROP_TRANSFORM);
    setCropImageSize(null);
    setSubmitError(null);
    setComposerMode("carousel");
    setMediaAspectRatio("4:5");
  };

  const openComposer = () => {
    setIsExpanded(true);
  };

  const updateText = (nextValue: string) => {
    setText(nextValue);
    if (submitError) setSubmitError(null);
    openComposer();
  };

  const togglePanel = (panel: ComposerPanel) => {
    setIsExpanded(true);
    setActivePanel((prev) => (prev === panel ? "none" : panel));
  };

  const setMode = (nextMode: ComposerMode) => {
    setComposerMode(nextMode);
  };

  const selectMediaAspectRatio = (ratio: MediaAspectRatio) => {
    setMediaAspectRatio(ratio);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (activeCropItem || cropQueue.length > 0) {
      setSubmitError("Selesaikan editor gambar terlebih dahulu sebelum posting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const result = await onPost(text, type, images.map((image) => image.file), {
        media_aspect_ratio: hasImages ? mediaAspectRatio : undefined,
      });

      if (result !== false) {
        resetComposer();
      } else {
        setSubmitError("Belum berhasil membagikan post. Coba lagi.");
      }
    } catch {
      setSubmitError("Terjadi gangguan saat mengirim post. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (targetId: string) => {
    setImages((prev) => prev.filter((image) => image.id !== targetId));
  };

  const setImageAsCover = (targetId: string) => {
    setImages((prev) => {
      const fromIndex = prev.findIndex((image) => image.id === targetId);
      return moveItemToIndex(prev, fromIndex, 0);
    });
  };

  const moveImage = (targetId: string, direction: "left" | "right") => {
    setImages((prev) => {
      const fromIndex = prev.findIndex((image) => image.id === targetId);
      const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
      return moveItemToIndex(prev, fromIndex, toIndex);
    });
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    const availableSlots = Math.max(0, MAX_COMPOSER_IMAGES - images.length - cropQueue.length - (activeCropItem ? 1 : 0));
    if (availableSlots <= 0) {
      setSubmitError(`Maksimal ${MAX_COMPOSER_IMAGES} gambar per post.`);
      return;
    }

    const nextFiles = files.slice(0, availableSlots);
    try {
      const prepared = await Promise.all(
        nextFiles.map(async (file) => ({
          id: buildImageId(file),
          file,
          source: await readFileAsDataUrl(file),
          aspectRatio: mediaAspectRatio,
          transform: DEFAULT_CROP_TRANSFORM,
        }))
      );
      setSubmitError(null);
      setCropQueue((prev) => [...prev, ...prepared]);
    } catch {
      setSubmitError("Gagal memuat gambar. Coba pilih ulang file.");
    }
  };

  const reopenCropForImage = (image: ComposerImage) => {
    setActiveCropItem({
      id: image.id,
      file: image.originalFile,
      source: image.originalSource,
      aspectRatio: image.aspectRatio,
      transform: image.transform,
      existingId: image.id,
    });
    setCropTransform(image.transform);
    setCropImageSize(null);
    if (composerMode === "free") {
      setMediaAspectRatio(image.aspectRatio);
    }
  };

  const closeCropDialog = () => {
    setActiveCropItem(null);
    setCropTransform(DEFAULT_CROP_TRANSFORM);
    setCropImageSize(null);
    setCropBusy(false);
  };

  const applyCrop = async () => {
    if (!activeCropItem) return;

    setCropBusy(true);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image();
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("Gagal memuat gambar."));
        nextImage.src = activeCropItem.source;
      });

      const outputWidth = 1440;
      const outputHeight = cropPreset.ratio
        ? Math.round(outputWidth / cropPreset.ratio)
        : Math.round(outputWidth * (image.naturalHeight / image.naturalWidth));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas crop tidak tersedia.");

      const baseScale = Math.min(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
      const finalScale = baseScale * cropTransform.scale;
      const drawWidth = image.naturalWidth * finalScale;
      const drawHeight = image.naturalHeight * finalScale;
      const viewportRatioX = outputWidth / cropViewport.width;
      const viewportRatioY = outputHeight / cropViewport.height;
      const drawX = (outputWidth - drawWidth) / 2 + cropTransform.x * viewportRatioX;
      const drawY = (outputHeight - drawHeight) / 2 + cropTransform.y * viewportRatioY;

      ctx.clearRect(0, 0, outputWidth, outputHeight);
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("Gagal menyiapkan hasil crop.");

      const nextFile = new File([blob], `${activeCropItem.file.name.replace(/\.[^.]+$/, "")}-community.jpg`, {
        type: "image/jpeg",
      });

      const nextComposerImage: ComposerImage = {
        id: activeCropItem.existingId || activeCropItem.id,
        file: nextFile,
        aspectRatio: mediaAspectRatio,
        originalFile: activeCropItem.file,
        originalSource: activeCropItem.source,
        transform: cropTransform,
      };

      setImages((prev) => {
        if (activeCropItem.existingId) {
          return prev.map((item) => (item.id === activeCropItem.existingId ? nextComposerImage : item));
        }

        return [...prev, nextComposerImage].slice(0, MAX_COMPOSER_IMAGES);
      });
      closeCropDialog();
    } catch {
      setCropBusy(false);
    }
  };

  const applyFitTransform = () => {
    setCropTransform(DEFAULT_CROP_TRANSFORM);
  };

  const applyFillTransform = () => {
    const nextScale = resolveFillScale(cropPreviewMetrics, cropViewport);
    setCropTransform(clampCropTransform({ x: 0, y: 0, scale: nextScale }, cropPreviewMetrics, cropViewport));
  };

  return {
    state,
    types,
    text,
    type,
    isExpanded,
    isSubmitting,
    composerMode,
    activePanel,
    images,
    previewUrls,
    mediaAspectRatio,
    cropQueue,
    activeCropItem,
    cropTransform,
    cropImageSize,
    cropBusy,
    submitError,
    availableRatioPresets,
    cropPreset,
    cropViewport,
    cropPreviewMetrics,
    hasImages,
    selectedTypeLabel,
    canSubmit,
    openComposer,
    updateText,
    setType,
    togglePanel,
    setMode,
    selectMediaAspectRatio,
    handleSubmit,
    resetComposer,
    removeImage,
    setImageAsCover,
    moveImage,
    handleFilesSelected,
    reopenCropForImage,
    closeCropDialog,
    setCropTransform,
    applyCrop,
    applyFitTransform,
    applyFillTransform,
  };
}
