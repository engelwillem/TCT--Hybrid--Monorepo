import { useEffect, useMemo, useState } from "react";
import {
  buildImageId,
  clampCropTransform,
  DEFAULT_CROP_TRANSFORM,
  MAX_COMPOSER_TOTAL_UPLOAD_BYTES,
  readFileAsDataUrl,
  type ComposerImage,
  type ComposerMode,
  type CropImageSize,
  type CropQueueItem,
  type CropTransform,
  type MediaAspectRatio,
  type RatioPreset,
} from "../components/post-composer/types";

type UseComposerCropParams = {
  composerMode: ComposerMode;
  mediaAspectRatio: MediaAspectRatio;
  cropPreset: RatioPreset;
  imageCount: number;
  maxImages: number;
  onApplyCroppedImage: (payload: { image: ComposerImage; existingId?: string }) => void;
  onSelectMediaAspectRatio: (ratio: MediaAspectRatio) => void;
  onError: (message: string | null) => void;
  existingImageTotalBytes?: number;
  onMediaAttached?: (count: number) => void;
  onCropApplied?: () => void;
};

const NORMALIZED_IMAGE_MAX_DIMENSION = 1600;
const NORMALIZED_IMAGE_TYPE = "image/jpeg";
const NORMALIZED_IMAGE_QUALITY = 0.82;
const TOTAL_IMAGE_PAYLOAD_ERROR =
  "Total ukuran gambar terlalu besar. Kurangi jumlah gambar atau gunakan gambar yang lebih ringan.";

export function clampFilesToTotalPayload(
  files: File[],
  startingBytes: number,
  maxTotalBytes: number = MAX_COMPOSER_TOTAL_UPLOAD_BYTES
): { accepted: File[]; overflowed: boolean; totalBytes: number } {
  let runningTotal = Math.max(0, startingBytes);
  const accepted: File[] = [];
  let overflowed = false;

  for (const file of files) {
    if (runningTotal + file.size > maxTotalBytes) {
      overflowed = true;
      continue;
    }

    runningTotal += file.size;
    accepted.push(file);
  }

  return { accepted, overflowed, totalBytes: runningTotal };
}

async function normalizeImageFile(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Gagal memuat gambar."));
      nextImage.src = objectUrl;
    });

    const largestDimension = Math.max(image.naturalWidth, image.naturalHeight);
    const shouldResize = largestDimension > NORMALIZED_IMAGE_MAX_DIMENSION;
    const resizeScale = shouldResize ? NORMALIZED_IMAGE_MAX_DIMENSION / largestDimension : 1;
    const targetWidth = Math.max(1, Math.round(image.naturalWidth * resizeScale));
    const targetHeight = Math.max(1, Math.round(image.naturalHeight * resizeScale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas normalisasi tidak tersedia.");
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, NORMALIZED_IMAGE_TYPE, NORMALIZED_IMAGE_QUALITY)
    );
    if (!blob) {
      throw new Error("Gagal menyiapkan gambar.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}-community.jpg`, {
      type: NORMALIZED_IMAGE_TYPE,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function useComposerCrop({
  composerMode,
  mediaAspectRatio,
  cropPreset,
  imageCount,
  maxImages,
  onApplyCroppedImage,
  onSelectMediaAspectRatio,
  onError,
  existingImageTotalBytes = 0,
  onMediaAttached,
  onCropApplied,
}: UseComposerCropParams) {
  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
  const [activeCropItem, setActiveCropItem] = useState<CropQueueItem | null>(null);
  const [cropTransform, setCropTransform] = useState<CropTransform>(DEFAULT_CROP_TRANSFORM);
  const [cropImageSize, setCropImageSize] = useState<CropImageSize | null>(null);
  const [cropBusy, setCropBusy] = useState(false);

  useEffect(() => {
    if (activeCropItem || cropQueue.length === 0) return;

    const [next, ...rest] = cropQueue;
    setActiveCropItem(next);
    setCropQueue(rest);
    setCropTransform(next.transform);
    setCropImageSize(null);

    if (composerMode === "free") {
      onSelectMediaAspectRatio(next.aspectRatio);
    }
  }, [activeCropItem, composerMode, cropQueue, onSelectMediaAspectRatio]);

  useEffect(() => {
    if (!activeCropItem) {
      setCropImageSize(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setCropImageSize({ width: image.naturalWidth, height: image.naturalHeight });
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

  const resolveImageSize = (source: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };
      image.onerror = () => reject(new Error("Gagal membaca ukuran gambar."));
      image.src = source;
    });

  const resolveSmartFitTransform = async (source: string, targetRatio: number | null): Promise<CropTransform> => {
    if (!targetRatio) {
      return DEFAULT_CROP_TRANSFORM;
    }

    try {
      const size = await resolveImageSize(source);
      if (size.width <= 0 || size.height <= 0) {
        return DEFAULT_CROP_TRANSFORM;
      }

      const imageRatio = size.width / size.height;
      if (!Number.isFinite(imageRatio) || imageRatio <= 0) {
        return DEFAULT_CROP_TRANSFORM;
      }

      const delta = imageRatio / targetRatio;
      const inverseDelta = targetRatio / imageRatio;
      const fillScale = Math.min(3, Math.max(1, delta, inverseDelta));

      return {
        x: 0,
        y: 0,
        scale: fillScale,
      };
    } catch {
      return DEFAULT_CROP_TRANSFORM;
    }
  };

  const attachMedia = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    const availableSlots = Math.max(0, maxImages - imageCount - cropQueue.length - (activeCropItem ? 1 : 0));
    if (availableSlots <= 0) {
      onError(`Maksimal ${maxImages} gambar per post.`);
      return;
    }

    const hasOverflowSelection = files.length > availableSlots;
    if (hasOverflowSelection) {
      onError(`Maksimal ${maxImages} gambar per post.`);
    }

    const nextFiles = files.slice(0, availableSlots);
    try {
      const prepared: Array<{
        id: string;
        file: File;
        originalFile: File;
        source: string;
        aspectRatio: MediaAspectRatio;
        transform: CropTransform;
      }> = [];
      let runningTotalBytes = Math.max(0, existingImageTotalBytes);
      let overflowedByTotalSize = false;

      for (const file of nextFiles) {
        const source = await readFileAsDataUrl(file);
        const normalizedFile = await normalizeImageFile(file);

        if (runningTotalBytes + normalizedFile.size > MAX_COMPOSER_TOTAL_UPLOAD_BYTES) {
          overflowedByTotalSize = true;
          continue;
        }

        runningTotalBytes += normalizedFile.size;
        const transform = await resolveSmartFitTransform(source, cropPreset.ratio);
        prepared.push({
          id: buildImageId(normalizedFile),
          file: normalizedFile,
          originalFile: file,
          source,
          aspectRatio: mediaAspectRatio,
          transform,
        });
      }

      if (overflowedByTotalSize) {
        onError(TOTAL_IMAGE_PAYLOAD_ERROR);
      } else if (hasOverflowSelection) {
        onError(`Maksimal ${maxImages} gambar per post.`);
      } else {
        onError(null);
      }

      prepared.forEach((item) => {
        const image: ComposerImage = {
          id: item.id,
          file: item.file,
          aspectRatio: item.aspectRatio,
          originalFile: item.originalFile,
          originalSource: item.source,
          transform: item.transform,
        };

        onApplyCroppedImage({ image });
      });
      if (prepared.length > 0) {
        onMediaAttached?.(prepared.length);
      }
    } catch {
      onError("Gagal memuat gambar. Coba pilih ulang file.");
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
      onSelectMediaAspectRatio(image.aspectRatio);
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

      onError(null);
      onApplyCroppedImage({ image: nextComposerImage, existingId: activeCropItem.existingId });
      onCropApplied?.();
      closeCropDialog();
    } catch {
      onError("Gagal menyiapkan hasil crop. Coba ulangi.");
      setCropBusy(false);
    }
  };

  const applyFitTransform = () => {
    setCropTransform(DEFAULT_CROP_TRANSFORM);
  };

  const applyFillTransform = () => {
    if (!cropPreviewMetrics) {
      setCropTransform(DEFAULT_CROP_TRANSFORM);
      return;
    }

    const fillScaleX = cropViewport.width / cropPreviewMetrics.width;
    const fillScaleY = cropViewport.height / cropPreviewMetrics.height;
    const nextScale = Math.min(3, Math.max(1, fillScaleX, fillScaleY));
    setCropTransform(clampCropTransform({ x: 0, y: 0, scale: nextScale }, cropPreviewMetrics, cropViewport));
  };

  const resetCropState = () => {
    setCropQueue([]);
    setActiveCropItem(null);
    setCropTransform(DEFAULT_CROP_TRANSFORM);
    setCropImageSize(null);
    setCropBusy(false);
  };

  const isProcessing = cropBusy || !!activeCropItem || cropQueue.length > 0;

  return {
    cropQueue,
    activeCropItem,
    cropTransform,
    cropImageSize,
    cropBusy,
    cropViewport,
    cropPreviewMetrics,
    isProcessing,
    attachMedia,
    reopenCropForImage,
    closeCropDialog,
    setCropTransform,
    applyCrop,
    applyFitTransform,
    applyFillTransform,
    resetCropState,
  };
}
