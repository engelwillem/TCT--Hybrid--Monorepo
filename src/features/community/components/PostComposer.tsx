"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Crop, ImagePlus, Star, X } from "lucide-react";
import type { CommunityUser } from "../types";
import { ActionBarButton } from "@/components/actions/ActionBarButton";
import { COMMUNITY_COMPOSER_TYPES, type CommunityComposerType } from "../categories";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type PostType = CommunityComposerType;
type ComposerMode = "carousel" | "free";
type MediaAspectRatio = "9:16" | "4:5" | "1:1" | "16:9" | "og" | "auto";

type PostComposerMetadata = {
  media_aspect_ratio?: MediaAspectRatio;
};

type CropTransform = {
  x: number;
  y: number;
  scale: number;
};

type CropQueueItem = {
  id: string;
  file: File;
  source: string;
  aspectRatio: MediaAspectRatio;
  transform: CropTransform;
  existingId?: string;
};

type CropImageSize = {
  width: number;
  height: number;
};

type ComposerImage = {
  id: string;
  file: File;
  aspectRatio: MediaAspectRatio;
  originalFile: File;
  originalSource: string;
  transform: CropTransform;
};

type RatioPreset = {
  value: MediaAspectRatio;
  label: string;
  ratio: number | null;
};

const CAROUSEL_RATIO_PRESETS: RatioPreset[] = [
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
  { value: "4:5", label: "4:5", ratio: 4 / 5 },
  { value: "1:1", label: "1:1", ratio: 1 },
];

const FREE_UPLOAD_RATIO_PRESETS: RatioPreset[] = [
  ...CAROUSEL_RATIO_PRESETS,
  { value: "auto", label: "Original", ratio: null },
  { value: "og", label: "1.9:1", ratio: 1.91 / 1 },
];

const DEFAULT_CROP_TRANSFORM: CropTransform = { x: 0, y: 0, scale: 1 };

function clampCropTransform(
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

function resolveFillScale(
  preview: { width: number; height: number } | null,
  viewport: { width: number; height: number }
): number {
  if (!preview) return 1;
  const fillScaleX = viewport.width / preview.width;
  const fillScaleY = viewport.height / preview.height;
  return Math.max(1, fillScaleX, fillScaleY);
}

function aspectRatioClass(value: MediaAspectRatio): string {
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

function moveItemToIndex<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Gagal membaca gambar."));
    reader.readAsDataURL(file);
  });
}

function buildImageId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

interface PostComposerProps {
  onPost: (text: string, type: PostType, images?: File[], metadata?: PostComposerMetadata) => Promise<boolean | void> | boolean | void;
  currentUser?: CommunityUser;
  className?: string;
  channels?: Array<{ id: string; slug: string; title: string }>;
  initialText?: string;
  initialType?: PostType;
  initialExpanded?: boolean;
}

export function PostComposer({
  onPost,
  currentUser,
  className,
  channels = [],
  initialText = "",
  initialType = "user_post",
  initialExpanded = false,
}: PostComposerProps) {
  const [text, setText] = useState(initialText);
  const [type, setType] = useState<PostType>(initialType);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [composerMode, setComposerMode] = useState<ComposerMode>("carousel");
  const [images, setImages] = useState<ComposerImage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [mediaAspectRatio, setMediaAspectRatio] = useState<MediaAspectRatio>("4:5");
  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
  const [activeCropItem, setActiveCropItem] = useState<CropQueueItem | null>(null);
  const [cropTransform, setCropTransform] = useState<CropTransform>(DEFAULT_CROP_TRANSFORM);
  const [cropImageSize, setCropImageSize] = useState<CropImageSize | null>(null);
  const [cropBusy, setCropBusy] = useState(false);
  const cropDragRef = useRef<{ pointerId: number; startX: number; startY: number; origin: CropTransform } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const types: { value: PostType; label: string }[] = COMMUNITY_COMPOSER_TYPES;
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

  const coverImage = images[0] ?? null;
  const coverPreviewUrl = coverImage ? previewUrls[coverImage.id] : null;
  const hasImages = Object.keys(previewUrls).length > 0;

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) return;
    try {
      setIsSubmitting(true);
      const result = await onPost(text, type, images.map((image) => image.file), {
        media_aspect_ratio: images.length > 0 ? mediaAspectRatio : undefined,
      });
      const shouldReset = result !== false;
      if (shouldReset) {
        setText("");
        setImages([]);
        setCropQueue([]);
        setIsExpanded(false);
        setMediaAspectRatio("4:5");
        setComposerMode("carousel");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (targetKey: string) => {
    setImages((prev) => prev.filter((image) => image.id !== targetKey));
  };

  const setImageAsCover = (targetKey: string) => {
    setImages((prev) => {
      const fromIndex = prev.findIndex((image) => image.id === targetKey);
      return moveItemToIndex(prev, fromIndex, 0);
    });
  };

  const moveImage = (targetKey: string, direction: "left" | "right") => {
    setImages((prev) => {
      const fromIndex = prev.findIndex((image) => image.id === targetKey);
      const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
      return moveItemToIndex(prev, fromIndex, toIndex);
    });
  };

  const handlePickImages = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    const availableSlots = Math.max(0, 10 - images.length - cropQueue.length - (activeCropItem ? 1 : 0));
    const nextFiles = files.slice(0, availableSlots);
    const prepared = await Promise.all(
      nextFiles.map(async (file) => ({
        id: buildImageId(file),
        file,
        source: await readFileAsDataUrl(file),
        aspectRatio: mediaAspectRatio,
        transform: DEFAULT_CROP_TRANSFORM,
      }))
    );
    setCropQueue((prev) => [...prev, ...prepared]);
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

  const handleCropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeCropItem || cropBusy) return;
    cropDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: cropTransform,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    setCropTransform(
      clampCropTransform(
        {
          ...drag.origin,
          x: drag.origin.x + deltaX,
          y: drag.origin.y + deltaY,
        },
        cropPreviewMetrics,
        cropViewport
      )
    );
  };

  const handleCropPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    cropDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const applyCrop = async () => {
    if (!activeCropItem) return;
    setCropBusy(true);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Gagal memuat gambar."));
        img.src = activeCropItem.source;
      });

      const outputWidth = 1440;
      const outputHeight = cropPreset.ratio ? Math.round(outputWidth / cropPreset.ratio) : Math.round(outputWidth * (image.naturalHeight / image.naturalWidth));
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

        return [...prev, nextComposerImage].slice(0, 10);
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
    setCropTransform(
      clampCropTransform(
        {
          x: 0,
          y: 0,
          scale: nextScale,
        },
        cropPreviewMetrics,
        cropViewport
      )
    );
  };

  const composerSummaryLabel = composerMode === "carousel" ? "Carousel" : "Free Upload";

  return (
    <>
      <Card
        className={cn(
          "rounded-[32px] bg-surface/80 shadow-premium backdrop-blur-3xl border border-border/60 overflow-hidden transition-all duration-500",
          isExpanded ? "ring-2 ring-brand/20 shadow-premium" : "",
          className
        )}
      >
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-5 px-6 pt-8 pb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="tct-serif text-[22px] tracking-tight leading-tight text-foreground/90">Ruang Berbagi</h2>
                </div>
                <p className="mt-1 text-[13px] font-medium tracking-wide text-foreground/50">Apa yang Tuhan taruh di hati Anda?</p>
              </div>
            </div>

            <div className="px-6">
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 px-0 py-3 text-[16px] leading-8 tracking-[0.01em] font-medium text-foreground placeholder:text-foreground/30 resize-none transition-all duration-500 outline-none"
                placeholder="Mulai menulis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                rows={isExpanded ? 4 : 1}
              />
            </div>

            {hasImages ? (
              <div className="px-6 pb-4 space-y-3">
                <div className="rounded-[28px] border border-border/60 bg-background/90 p-3 shadow-soft">
                  {coverImage && coverPreviewUrl ? (
                    <button
                      type="button"
                      onClick={() => reopenCropForImage(coverImage)}
                      className={cn(
                        "relative block w-full overflow-hidden rounded-[22px] bg-surface-muted ring-1 ring-border/60",
                        aspectRatioClass(composerMode === "carousel" ? mediaAspectRatio : coverImage.aspectRatio)
                      )}
                    >
                      <img src={coverPreviewUrl} alt="Cover preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                        <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                          Cover
                        </span>
                        <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                          {images.length} Foto
                        </span>
                      </div>
                    </button>
                  ) : null}
                </div>

                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
                  {images.map((image, index) => {
                    const url = previewUrls[image.id];
                    if (!url) return null;
                    const displayRatio = composerMode === "carousel" ? mediaAspectRatio : image.aspectRatio;
                    const isCover = index === 0;
                    return (
                      <div
                        key={image.id}
                        className="group relative shrink-0 snap-start rounded-[22px] border border-border/60 bg-background/90 p-2 shadow-soft"
                      >
                        <button
                          type="button"
                          onClick={() => reopenCropForImage(image)}
                          className={cn("block w-28 overflow-hidden rounded-[18px] bg-surface-muted", aspectRatioClass(displayRatio))}
                        >
                          <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/55">{index + 1}</span>
                          {isCover ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700 ring-1 ring-amber-200">
                              <Star className="h-3 w-3 fill-current" />
                              Cover
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => reopenCropForImage(image)}
                            className="rounded-full border border-border/60 px-2 py-1.5 text-[10px] font-bold text-foreground/70 transition-colors hover:bg-surface-muted"
                          >
                            Posisi
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageAsCover(image.id)}
                            disabled={isCover}
                            className={cn(
                              "rounded-full border px-2 py-1.5 text-[10px] font-bold transition-colors",
                              isCover
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-border/60 text-foreground/70 hover:bg-surface-muted"
                            )}
                          >
                            Set as cover
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(image.id, "left")}
                            disabled={index === 0}
                            className="rounded-full border border-border/60 px-2 py-1.5 text-[10px] font-bold text-foreground/70 transition-colors hover:bg-surface-muted disabled:opacity-35"
                          >
                            Left
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(image.id, "right")}
                            disabled={index === images.length - 1}
                            className="rounded-full border border-border/60 px-2 py-1.5 text-[10px] font-bold text-foreground/70 transition-colors hover:bg-surface-muted disabled:opacity-35"
                          >
                            Right
                          </button>
                        </div>
                        <button
                          type="button"
                          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md shadow-md hover:bg-black/80 transition-colors"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {isExpanded ? (
              <div className="flex flex-col animate-in fade-in duration-500">
                <div className="px-6 py-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {(["carousel", "free"] as const).map((mode) => {
                      const active = composerMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setComposerMode(mode)}
                          className={cn(
                            "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-all",
                            active
                              ? "bg-foreground text-background shadow-lg"
                              : "border border-border/60 bg-background/80 text-foreground/60 hover:bg-background"
                          )}
                        >
                          {mode === "carousel" ? "Carousel" : "Free Upload"}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as PostType)}
                        className="appearance-none bg-transparent hover:bg-surface-muted text-[13px] font-medium text-foreground/60 rounded-full pl-2 pr-7 py-1.5 outline-none focus:ring-2 focus:ring-foreground/10 transition-all cursor-pointer"
                      >
                        {types.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    <span className="rounded-full bg-brand/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-brand">
                      {composerSummaryLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableRatioPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setMediaAspectRatio(preset.value)}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-[11px] font-black tracking-[0.12em] transition-all",
                          mediaAspectRatio === preset.value
                            ? "bg-slate-950 text-white shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]"
                            : "border border-border/60 bg-background/85 text-foreground/65 hover:bg-background"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="w-full rounded-[22px] bg-background/86 p-2 ring-1 ring-border/60 backdrop-blur-xl flex items-center gap-2">
                    <ActionBarButton icon={ImagePlus} label="Upload" variant="secondary" onClick={handlePickImages} type="button" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        handleFilesSelected(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                    <ActionBarButton
                      label="Cancel"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => {
                        setIsExpanded(false);
                        setText("");
                        setImages([]);
                        setCropQueue([]);
                        setComposerMode("carousel");
                        setMediaAspectRatio("4:5");
                      }}
                    />
                    <ActionBarButton
                      label={isSubmitting ? "..." : "Posting"}
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={(!text.trim() && images.length === 0) || isSubmitting}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!activeCropItem} onOpenChange={(open) => (!open ? closeCropDialog() : null)}>
        <DialogContent
          className="grid max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[820px] grid-rows-[auto_minmax(0,1fr)_auto] rounded-[2rem] border-border/60 bg-background p-0 overflow-hidden sm:max-h-[calc(100dvh-2rem)] sm:w-full"
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="border-b border-border/50 px-6 py-5 text-left">
            <DialogTitle className="text-xl font-black tracking-tight text-foreground">Carousel Editor</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {availableRatioPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setMediaAspectRatio(preset.value)}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-[11px] font-black tracking-[0.12em] transition-all",
                      mediaAspectRatio === preset.value
                        ? "bg-slate-950 text-white shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]"
                        : "border border-border/60 bg-background/85 text-foreground/65 hover:bg-background"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div
                    className={cn(
                      "relative mx-auto overflow-hidden rounded-[2rem] border border-border/60 bg-surface shadow-soft",
                      cropBusy ? "pointer-events-none opacity-70" : "cursor-grab active:cursor-grabbing"
                    )}
                    style={{ width: `${cropViewport.width}px`, height: `${cropViewport.height}px` }}
                    onDoubleClick={() => {
                      if (cropTransform.scale > 1.01) {
                        applyFitTransform();
                        return;
                      }
                      applyFillTransform();
                    }}
                    onPointerDown={handleCropPointerDown}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    onPointerCancel={handleCropPointerUp}
                  >
                    {activeCropItem ? (
                      <img
                        src={activeCropItem.source}
                        alt="Crop preview"
                        className="absolute left-1/2 top-1/2 select-none"
                        draggable={false}
                        style={{
                          width: cropPreviewMetrics ? `${cropPreviewMetrics.width}px` : "100%",
                          height: cropPreviewMetrics ? `${cropPreviewMetrics.height}px` : "100%",
                          maxWidth: "none",
                          maxHeight: "none",
                          transform: `translate(calc(-50% + ${cropTransform.x}px), calc(-50% + ${cropTransform.y}px)) scale(${cropTransform.scale})`,
                          transformOrigin: "center center",
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-muted-foreground">
                    <span>Drag</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <span>Zoom</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <span>Double tap</span>
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.75rem] border border-border/50 bg-surface-muted/40 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={applyFitTransform} className="rounded-full">
                      Fit
                    </Button>
                    <Button type="button" variant="outline" onClick={applyFillTransform} className="rounded-full">
                      Fill
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Zoom</p>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-brand">{Math.round(cropTransform.scale * 100)}%</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCropTransform((prev) =>
                            clampCropTransform({ ...prev, scale: Math.max(1, prev.scale - 0.05) }, cropPreviewMetrics, cropViewport)
                          )
                        }
                        className="h-10 w-10 rounded-xl border border-border/60 bg-background text-sm font-black"
                      >
                        -
                      </button>
                      <Slider
                        value={[cropTransform.scale]}
                        min={1}
                        max={3}
                        step={0.01}
                        onValueChange={([value]) =>
                          setCropTransform((prev) => clampCropTransform({ ...prev, scale: value }, cropPreviewMetrics, cropViewport))
                        }
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCropTransform((prev) =>
                            clampCropTransform({ ...prev, scale: Math.min(3, prev.scale + 0.05) }, cropPreviewMetrics, cropViewport)
                          )
                        }
                        className="h-10 w-10 rounded-xl border border-border/60 bg-background text-sm font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={applyFitTransform} className="w-full rounded-full">
                    <Crop className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border/50 bg-background px-6 py-5">
            <Button type="button" variant="outline" onClick={closeCropDialog} disabled={cropBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="button" onClick={applyCrop} disabled={cropBusy || !activeCropItem} className="rounded-full">
              {cropBusy ? "Memproses..." : "Gunakan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
