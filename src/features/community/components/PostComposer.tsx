"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Crop, History, ImagePlus, RefreshCcw, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useComposerAnalytics } from "../hooks/useComposerAnalytics";
import { readComposerDraftSeed, useComposerDraft } from "../hooks/useComposerDraft";
import { useComposerCrop } from "../hooks/useComposerCrop";
import { useComposerLifecycle } from "../hooks/useComposerLifecycle";
import { useComposerMedia } from "../hooks/useComposerMedia";
import { useComposerPrompt } from "../hooks/useComposerPrompt";
import { useComposerSubmit } from "../hooks/useComposerSubmit";
import { useComposerText } from "../hooks/useComposerText";
import { useComposerExperiments } from "../hooks/useComposerExperiments";
import type { CommunityUser } from "../types";
import { ComposerActionBar } from "./post-composer/ComposerActionBar";
import { ComposerInput } from "./post-composer/ComposerInput";
import { ComposerMediaStrip } from "./post-composer/ComposerMediaStrip";
import { ComposerShell } from "./post-composer/ComposerShell";
import { ComposerTypeChips } from "./post-composer/ComposerTypeChips";
import {
  clampCropTransform,
  MAX_COMPOSER_IMAGES,
  POST_COMPOSER_TYPES,
  type CropTransform,
  type PostComposerMetadata,
  type PostType,
} from "./post-composer/types";
import { formatRelativeTime } from "../utils/time";

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
  void currentUser;
  void channels;

  const canRestoreDraft = initialText.trim().length === 0;
  const draftSeed = useMemo(() => (canRestoreDraft ? readComposerDraftSeed() : null), [canRestoreDraft]);

  const [type, setType] = useState<PostType>(draftSeed?.type ?? initialType);
  const composerTypes = POST_COMPOSER_TYPES;
  
  const experiments = useComposerExperiments();

  const analytics = useComposerAnalytics({
    experiments: {
      promptTone: experiments.promptTone,
      promptLength: experiments.promptLength,
      draftRestore: experiments.draftRestore,
    }
  });
  
  const submitDomain = useComposerSubmit({ onPost });

  const lifecycleDomain = useComposerLifecycle({
    initialExpanded: initialExpanded || Boolean(draftSeed?.text?.trim()),
  });

  const textDomain = useComposerText({
    initialText: draftSeed?.text ?? initialText,
    onExpand: lifecycleDomain.openComposer,
    onUserInput: submitDomain.clearSubmitError,
  });

  const mediaDomain = useComposerMedia({
    initialMode: draftSeed?.composerMode,
    initialAspectRatio: draftSeed?.mediaAspectRatio,
    maxImages: MAX_COMPOSER_IMAGES,
  });

  const cropDomain = useComposerCrop({
    composerMode: mediaDomain.composerMode,
    mediaAspectRatio: mediaDomain.mediaAspectRatio,
    cropPreset: mediaDomain.cropPreset,
    imageCount: mediaDomain.images.length,
    maxImages: MAX_COMPOSER_IMAGES,
    onApplyCroppedImage: ({ image, existingId }) => {
      mediaDomain.updateMedia({ kind: "upsert", image, existingId });
    },
    onSelectMediaAspectRatio: mediaDomain.setMediaAspectRatio,
    onError: submitDomain.setSubmitError,
    onMediaAttached: (count) => {
      analytics.trackAttachMedia({
        postType: type,
        mediaCount: count,
        mediaAspectRatio: mediaDomain.mediaAspectRatio,
      });
    },
    onCropApplied: () => {
      analytics.trackCropApplied({
        postType: type,
        hasMedia: mediaDomain.hasImages,
        mediaCount: mediaDomain.images.length,
        mediaAspectRatio: mediaDomain.mediaAspectRatio,
      });
    },
  });

  const draftDomain = useComposerDraft({
    text: textDomain.text,
    type,
    composerMode: mediaDomain.composerMode,
    mediaAspectRatio: mediaDomain.mediaAspectRatio,
    canRestore: canRestoreDraft,
  });

  const {
    restoredDraftAt,
    isSaving,
    lastSavedAt,
    markDraftRestored,
    clearDraft,
  } = draftDomain;

  const draftAgeLabel = useMemo(() => formatRelativeTime(restoredDraftAt), [restoredDraftAt]);
  const lastSavedLabel = useMemo(() => formatRelativeTime(lastSavedAt), [lastSavedAt]);

  const draftStatusSlot = (
    <div className="flex items-center gap-1.5 opacity-60">
      {isSaving ? (
        <RefreshCcw className="h-3 w-3 animate-spin text-sky-500" />
      ) : lastSavedAt ? (
        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
           <Check className="h-2 w-2" />
        </div>
      ) : null}
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {isSaving ? "Menyimpan" : lastSavedAt ? `Saved ${lastSavedLabel}` : null}
      </span>
    </div>
  );

  const promptModel = useComposerPrompt({
    postType: type,
    hasRestoredDraft: Boolean(restoredDraftAt),
    experiments,
  });

  const hasPendingCrop = Boolean(cropDomain.activeCropItem) || cropDomain.cropQueue.length > 0;
  const canSubmit = Boolean(textDomain.text.trim() || mediaDomain.hasImages);

  const resetComposer = ({ clearDraft = true }: { clearDraft?: boolean } = {}) => {
    lifecycleDomain.resetLifecycle();
    textDomain.resetText();
    mediaDomain.resetMedia();
    cropDomain.resetCropState();
    submitDomain.clearSubmitError();
    analytics.resetSessionDedupe();
    if (clearDraft) {
      draftDomain.clearDraft();
    }
  };

  const handleSubmit = async () => {
    if (hasPendingCrop) {
      analytics.trackSubmitFailure({
        postType: type,
        hasMedia: mediaDomain.hasImages,
        mediaCount: mediaDomain.images.length,
        textLength: textDomain.text.trim().length,
        reason: "pending_crop",
      });
    }

    const result = await submitDomain.submit({
      text: textDomain.text,
      type,
      images: mediaDomain.images.map((image) => image.file),
      metadata: {
        media_aspect_ratio: mediaDomain.hasImages ? mediaDomain.mediaAspectRatio : undefined,
      },
      hasPendingCrop,
    });

    if (result) {
      analytics.trackSubmitSuccess({
        postType: type,
        hasMedia: mediaDomain.hasImages,
        mediaCount: mediaDomain.images.length,
        mediaAspectRatio: mediaDomain.mediaAspectRatio,
        textLength: textDomain.text.trim().length,
      });
      resetComposer({ clearDraft: true });
      return;
    }

    if (result === false) {
      analytics.trackSubmitFailure({
        postType: type,
        hasMedia: mediaDomain.hasImages,
        mediaCount: mediaDomain.images.length,
        mediaAspectRatio: mediaDomain.mediaAspectRatio,
        textLength: textDomain.text.trim().length,
        reason: "submit_failed",
      });
    }
  };

  useEffect(() => {
    if (!lifecycleDomain.isExpanded) return;
    analytics.trackComposerOpen({
      postType: type,
      hasMedia: mediaDomain.hasImages,
      mediaCount: mediaDomain.images.length,
    });
  }, [analytics, lifecycleDomain.isExpanded, mediaDomain.hasImages, mediaDomain.images.length, type]);

  useEffect(() => {
    if (!textDomain.hasTypedText) return;
    analytics.trackTypingStart({
      postType: type,
      textLength: textDomain.text.trim().length,
      hasMedia: mediaDomain.hasImages,
    });
  }, [analytics, mediaDomain.hasImages, textDomain.hasTypedText, textDomain.text, type]);

  useEffect(() => {
    if (!draftSeed) return;
    draftDomain.markDraftRestored(draftSeed.savedAt);
    analytics.trackDraftRestored({
      postType: draftSeed.type,
      textLength: draftSeed.text.trim().length,
      restoredDraftAgeMinutes: Math.max(0, Math.round((Date.now() - draftSeed.savedAt) / 60000)),
    });
  }, [analytics, draftDomain.markDraftRestored, draftSeed]);

  const selectedTypeLabel = useMemo(
    () => composerTypes.find((item) => item.value === type)?.label ?? "Curahan Hati",
    [composerTypes, type]
  );

  const cropDragRef = useRef<{ pointerId: number; startX: number; startY: number; origin: CropTransform } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cropDomain.activeCropItem || cropDomain.cropBusy) return;

    cropDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: cropDomain.cropTransform,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    cropDomain.setCropTransform(
      clampCropTransform(
        {
          ...drag.origin,
          x: drag.origin.x + deltaX,
          y: drag.origin.y + deltaY,
        },
        cropDomain.cropPreviewMetrics,
        cropDomain.cropViewport
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

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleCancelComposer = () => {
    resetComposer({ clearDraft: true });
  };

  const draftSavedAtLabel = draftDomain.restoredDraftAt ? new Date(draftDomain.restoredDraftAt).toLocaleString() : null;

  return (
    <>
      <ComposerShell isExpanded={lifecycleDomain.isExpanded} className={className}>
        <div className="flex flex-col">
          <div className="flex items-start gap-4 px-6 pb-3 pt-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-surface-muted ring-2 ring-white shadow-soft">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-[12px] font-black uppercase text-brand">{(currentUser?.name || "U")[0]}</span>
              )}
            </div>
            <div className="flex-1 space-y-1 py-1">
              <h2 className="tct-serif text-[22px] leading-tight tracking-tight text-foreground/90">Ruang Berbagi</h2>
              <p className="text-[12px] font-medium leading-relaxed tracking-[0.01em] text-foreground/50">
                {promptModel.helper}
              </p>
            </div>
          </div>

          <ComposerInput
            value={textDomain.text}
            isExpanded={lifecycleDomain.isExpanded}
            placeholder={promptModel.placeholder}
            onFocus={lifecycleDomain.openComposer}
            onChange={textDomain.updateText}
          />

          <ComposerMediaStrip
            hasImages={mediaDomain.hasImages}
            images={mediaDomain.images}
            previewUrls={mediaDomain.previewUrls}
            composerMode={mediaDomain.composerMode}
            mediaAspectRatio={mediaDomain.mediaAspectRatio}
            onReopenCrop={cropDomain.reopenCropForImage}
            onSetCover={(id) => mediaDomain.updateMedia({ kind: "setCover", id })}
            onMoveImage={(id, direction) => mediaDomain.updateMedia({ kind: "move", id, direction })}
            onRemoveImage={(id) => mediaDomain.updateMedia({ kind: "remove", id })}
          />

          {lifecycleDomain.isExpanded ? (
            <div className="space-y-4 px-6 pb-4">
              <ComposerTypeChips
                activePanel={lifecycleDomain.activePanel}
                selectedTypeLabel={selectedTypeLabel}
                composerMode={mediaDomain.composerMode}
                hasImages={mediaDomain.hasImages}
                mediaAspectRatio={mediaDomain.mediaAspectRatio}
                onTogglePanel={lifecycleDomain.togglePanel}
              />

              {restoredDraftAt ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 px-4 py-2.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80 text-sky-600">
                      <History className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-sky-900">Melanjutkan draf sebelumnya</p>
                      <p className="text-[10px] font-medium text-sky-700/70">Draf dari {draftAgeLabel}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => resetComposer({ clearDraft: true })}
                    className="rounded-lg bg-sky-100/50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-700 transition-colors hover:bg-sky-200/50 hover:text-sky-900"
                  >
                    Hapus
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false} mode="wait">
                {lifecycleDomain.activePanel === "media" ? (
                  <motion.div
                    key="composer-media-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-3.5 rounded-[22px] border border-border/60 bg-background/90 p-4 shadow-soft"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/45">Editor Media</p>
                    <div className="flex flex-wrap gap-2">
                      {(["carousel", "free"] as const).map((mode) => {
                        const active = mediaDomain.composerMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => mediaDomain.setComposerMode(mode)}
                            className={cn(
                              "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-all",
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
                    <div className="flex flex-wrap gap-2">
                      {mediaDomain.availableRatioPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => mediaDomain.setMediaAspectRatio(preset.value)}
                          className={cn(
                            "rounded-full px-3.5 py-2 text-[11px] font-black tracking-[0.12em] transition-all",
                            mediaDomain.mediaAspectRatio === preset.value
                              ? "bg-slate-950 text-white shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]"
                              : "border border-border/60 bg-background/85 text-foreground/65 hover:bg-background"
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openImagePicker}
                      className="h-11 rounded-full border-border/60 bg-white/70 px-5 text-[12px] font-black uppercase tracking-[0.15em] text-foreground/80 hover:bg-white"
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Upload Gambar (Maks 5)
                    </Button>
                  </motion.div>
                ) : null}

                {lifecycleDomain.activePanel === "category" ? (
                  <motion.div
                    key="composer-type-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="rounded-[22px] border border-border/60 bg-background/90 p-4 shadow-soft"
                  >
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/50">Kategori Konten</p>
                    <div className="relative">
                      <select
                        value={type}
                        onChange={(event) => {
                          setType(event.target.value as PostType);
                          submitDomain.clearSubmitError();
                        }}
                        className="h-11 w-full appearance-none rounded-full border border-border/60 bg-white/90 px-4 pr-10 text-[13px] font-semibold text-foreground/80 outline-none transition focus:ring-2 focus:ring-sky-200/50"
                      >
                        {composerTypes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  void cropDomain.attachMedia(event.target.files);
                  event.currentTarget.value = "";
                }}
              />

              {submitDomain.submitError ? (
                <p className="rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-[12px] font-semibold text-rose-700">
                  {submitDomain.submitError}
                </p>
              ) : null}

              <ComposerActionBar
                canSubmit={canSubmit}
                isSubmitting={submitDomain.isSubmitting}
                statusSlot={draftStatusSlot}
                onCancel={handleCancelComposer}
                onSubmit={() => void handleSubmit()}
              />
            </div>
          ) : null}
        </div>
      </ComposerShell>

      <Dialog open={!!cropDomain.activeCropItem} onOpenChange={(open) => (!open ? cropDomain.closeCropDialog() : null)}>
        <DialogContent
          className="grid max-h-[calc(100dvh-0.5rem)] w-[calc(100vw-0.5rem)] max-w-[820px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[1.4rem] border-border/60 bg-background p-0 sm:max-h-[calc(100dvh-1.5rem)] sm:w-full sm:rounded-[2rem]"
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="border-b border-border/50 px-5 py-4 text-left sm:px-6 sm:py-5">
            <DialogTitle className="text-[18px] font-black tracking-tight text-foreground sm:text-xl">Carousel Editor</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/45">Rasio</p>
                <div className="flex flex-wrap gap-2">
                  {mediaDomain.availableRatioPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => mediaDomain.setMediaAspectRatio(preset.value)}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-[11px] font-black tracking-[0.12em] transition-all",
                        mediaDomain.mediaAspectRatio === preset.value
                          ? "bg-slate-950 text-white shadow-[0_16px_34px_-20px_rgba(15,23,42,0.5)]"
                          : "border border-border/60 bg-background/85 text-foreground/65 hover:bg-background"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_250px]">
                <div className="space-y-4">
                  <div
                    className={cn(
                      "relative mx-auto overflow-hidden rounded-[1.5rem] border border-border/60 bg-surface shadow-soft sm:rounded-[2rem]",
                      cropDomain.cropBusy ? "pointer-events-none opacity-70" : "cursor-grab active:cursor-grabbing"
                    )}
                    style={{ width: `${cropDomain.cropViewport.width}px`, height: `${cropDomain.cropViewport.height}px` }}
                    onDoubleClick={() => {
                      if (cropDomain.cropTransform.scale > 1.01) {
                        cropDomain.applyFitTransform();
                        return;
                      }
                      cropDomain.applyFillTransform();
                    }}
                    onPointerDown={handleCropPointerDown}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    onPointerCancel={handleCropPointerUp}
                  >
                    {cropDomain.activeCropItem ? (
                      <img
                        src={cropDomain.activeCropItem.source}
                        alt="Crop preview"
                        className="absolute left-1/2 top-1/2 select-none"
                        draggable={false}
                        style={{
                          width: cropDomain.cropPreviewMetrics ? `${cropDomain.cropPreviewMetrics.width}px` : "100%",
                          height: cropDomain.cropPreviewMetrics ? `${cropDomain.cropPreviewMetrics.height}px` : "100%",
                          maxWidth: "none",
                          maxHeight: "none",
                          transform: `translate(calc(-50% + ${cropDomain.cropTransform.x}px), calc(-50% + ${cropDomain.cropTransform.y}px)) scale(${cropDomain.cropTransform.scale})`,
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

                <div className="space-y-4 rounded-[1.4rem] border border-border/50 bg-surface-muted/40 p-4 sm:rounded-[1.75rem]">
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={cropDomain.applyFitTransform} className="rounded-full">
                      Fit
                    </Button>
                    <Button type="button" variant="outline" onClick={cropDomain.applyFillTransform} className="rounded-full">
                      Fill
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Zoom</p>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-brand">{Math.round(cropDomain.cropTransform.scale * 100)}%</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          cropDomain.setCropTransform((prev) =>
                            clampCropTransform(
                              { ...prev, scale: Math.max(1, prev.scale - 0.05) },
                              cropDomain.cropPreviewMetrics,
                              cropDomain.cropViewport
                            )
                          )
                        }
                        className="h-10 w-10 rounded-xl border border-border/60 bg-background text-sm font-black"
                      >
                        -
                      </button>
                      <Slider
                        value={[cropDomain.cropTransform.scale]}
                        min={1}
                        max={3}
                        step={0.01}
                        onValueChange={([value]) =>
                          cropDomain.setCropTransform((prev) =>
                            clampCropTransform({ ...prev, scale: value }, cropDomain.cropPreviewMetrics, cropDomain.cropViewport)
                          )
                        }
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          cropDomain.setCropTransform((prev) =>
                            clampCropTransform(
                              { ...prev, scale: Math.min(3, prev.scale + 0.05) },
                              cropDomain.cropPreviewMetrics,
                              cropDomain.cropViewport
                            )
                          )
                        }
                        className="h-10 w-10 rounded-xl border border-border/60 bg-background text-sm font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={cropDomain.applyFitTransform} className="w-full rounded-full">
                    <Crop className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border/50 bg-background px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 sm:px-6 sm:py-5">
            <Button type="button" variant="outline" onClick={cropDomain.closeCropDialog} disabled={cropDomain.cropBusy} className="rounded-full">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void cropDomain.applyCrop()}
              disabled={cropDomain.cropBusy || !cropDomain.activeCropItem}
              className="rounded-full"
            >
              {cropDomain.cropBusy ? "Memproses..." : "Gunakan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
