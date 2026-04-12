import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  Check,
  Crop,
  History,
  ImagePlus,
  Images,
  LayoutTemplate,
  RefreshCcw,
} from "lucide-react";
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
  onPost: (
    text: string,
    type: PostType,
    images?: File[],
    metadata?: PostComposerMetadata
  ) => Promise<boolean | void> | boolean | void;
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
    },
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

  const { restoredDraftAt, isSaving, lastSavedAt, markDraftRestored, clearDraft } = draftDomain;
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
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden sm:inline">
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
    analytics.trackComposerOpen({ postType: type, hasMedia: mediaDomain.hasImages, mediaCount: mediaDomain.images.length });
  }, [analytics, lifecycleDomain.isExpanded, mediaDomain.hasImages, mediaDomain.images.length, type]);

  useEffect(() => {
    if (!textDomain.hasTypedText) return;
    analytics.trackTypingStart({ postType: type, textLength: textDomain.text.trim().length, hasMedia: mediaDomain.hasImages });
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

  const cropDragRef = useRef<{ pointerId: number; startX: number; startY: number; origin: CropTransform } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cropDomain.activeCropItem || cropDomain.cropBusy) return;
    cropDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: cropDomain.cropTransform };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    cropDomain.setCropTransform(
      clampCropTransform(
        { ...drag.origin, x: drag.origin.x + deltaX, y: drag.origin.y + deltaY },
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

  const openImagePicker = () => fileInputRef.current?.click();

  // Toolbar Component for Code Reusability (Desktop Vertical and Mobile Horizontal)
  const renderActionTools = (isMobile: boolean) => (
    <div className={cn("flex", isMobile ? "flex-row items-center gap-1.5" : "flex-col gap-2")}>
      <button
        type="button"
        title="Pilih Gambar"
        onClick={openImagePicker}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
          mediaDomain.hasImages
            ? "bg-brand/10 text-brand"
            : "bg-surface-muted/50 text-foreground/50 hover:bg-surface-muted hover:text-foreground"
        )}
      >
        <ImagePlus className="h-4 w-4" />
      </button>

      {mediaDomain.hasImages && (
        <button
          type="button"
          title="Ubah Mode Tampilan Gambar"
          onClick={() => mediaDomain.setComposerMode(mediaDomain.composerMode === "carousel" ? "free" : "carousel")}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
            "bg-surface-muted/50 text-foreground/60 hover:bg-surface-muted hover:text-foreground"
          )}
        >
          {mediaDomain.composerMode === "carousel" ? <Images className="h-4 w-4" /> : <LayoutTemplate className="h-4 w-4" />}
        </button>
      )}

      <button
        type="button"
        title="Kategori Konten"
        onClick={() => lifecycleDomain.togglePanel("category")}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
          lifecycleDomain.activePanel === "category"
            ? "bg-brand/10 text-brand"
            : type !== "user_post" 
              ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
              : "bg-surface-muted/50 text-foreground/50 hover:bg-surface-muted hover:text-foreground"
        )}
      >
        <AlignLeft className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <>
      <div className={cn("relative mx-auto flex w-full max-w-[660px] flex-col md:flex-row items-start transition-all md:pr-16", className)}>
        <ComposerShell isExpanded={lifecycleDomain.isExpanded} className="w-full flex-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 px-6 pb-2 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted ring-1 ring-border/40 shadow-sm">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-[12px] font-black uppercase text-brand">{(currentUser?.name || "U")[0]}</span>
                )}
              </div>
              <h2 className="tct-serif text-[18px] leading-tight tracking-tight text-foreground/80">
                Ruang Berbagi
              </h2>
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
              onAddImageContextual={openImagePicker}
            />

            {lifecycleDomain.isExpanded ? (
              <div className="flex flex-col">
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

                <AnimatePresence initial={false} mode="wait">
                  {lifecycleDomain.activePanel === "category" ? (
                    <motion.div
                      key="composer-type-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="px-6 pb-3"
                    >
                      <div className="rounded-[18px] bg-surface-muted/30 p-3">
                        <select
                          value={type}
                          onChange={(event) => {
                            setType(event.target.value as PostType);
                            submitDomain.clearSubmitError();
                            lifecycleDomain.togglePanel("category");
                          }}
                          className="h-10 w-full appearance-none rounded-full border border-border/60 bg-white px-4 pr-10 text-[13px] font-semibold text-foreground/80 outline-none focus:ring-2 focus:ring-brand/30"
                        >
                          {composerTypes.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {restoredDraftAt ? (
                  <div className="mx-6 mb-4 flex items-center justify-between gap-3 rounded-[18px] border border-sky-100 bg-sky-50/50 px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100/80 text-sky-600">
                        <History className="h-3 w-3" />
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

                {submitDomain.submitError ? (
                  <div className="mx-6 mb-4 rounded-[16px] border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-[12px] font-bold text-rose-700">
                    {submitDomain.submitError}
                  </div>
                ) : null}

                {/* Mobile Floating Action Toolbar (Hidden on Desktop) */}
                <div className="md:hidden flex items-center justify-between px-6 pb-2">
                   {renderActionTools(true)}
                </div>

                <ComposerActionBar
                  canSubmit={canSubmit}
                  isSubmitting={submitDomain.isSubmitting}
                  statusSlot={draftStatusSlot}
                  onCancel={() => resetComposer({ clearDraft: true })}
                  onSubmit={() => void handleSubmit()}
                />
              </div>
            ) : null}
          </div>
        </ComposerShell>

        {/* Desktop Vertical Icon Dock (Hidden on Mobile) */}
        {lifecycleDomain.isExpanded && (
          <div className="hidden md:flex absolute right-0 top-6 flex-col items-center gap-2 rounded-full border border-border/50 bg-white/90 p-1.5 shadow-[0_12px_24px_-10px_rgba(15,23,42,0.12)] backdrop-blur-xl animate-in slide-in-from-right-4 fade-in">
             {renderActionTools(false)}
          </div>
        )}
      </div>

      <Dialog open={!!cropDomain.activeCropItem} onOpenChange={(open) => (!open ? cropDomain.closeCropDialog() : null)}>
        <DialogContent
          className="grid max-h-[calc(100dvh-0.5rem)] w-[calc(100vw-0.5rem)] max-w-[820px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[1.4rem] border-border/60 bg-background p-0 sm:max-h-[calc(100dvh-1.5rem)] sm:w-full sm:rounded-[40px]"
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="px-5 py-4 text-left sm:px-6 sm:py-5 border-b border-border/20">
            <DialogTitle className="text-[17px] font-black tracking-tight text-foreground sm:text-[19px]">
              Editor Gambar
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <div
                  className={cn(
                    "relative mx-auto overflow-hidden rounded-[1.5rem] border-0 bg-surface shadow-soft sm:rounded-[2rem]",
                    cropDomain.cropBusy ? "pointer-events-none opacity-70" : "cursor-grab active:cursor-grabbing"
                  )}
                  style={{ width: `${cropDomain.cropViewport.width}px`, height: `${cropDomain.cropViewport.height}px` }}
                  onDoubleClick={() => {
                    if (cropDomain.cropTransform.scale > 1.01) { cropDomain.applyFitTransform(); return; }
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
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-3">Orientasi</p>
                  <div className="flex flex-wrap gap-2">
                    {mediaDomain.availableRatioPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => mediaDomain.setMediaAspectRatio(preset.value)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[10px] font-black tracking-[0.14em] transition-all",
                          mediaDomain.mediaAspectRatio === preset.value
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-surface-muted/50 text-foreground/60 hover:bg-surface-muted"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Zoom</p>
                    <span className="text-[10px] font-black tracking-[0.1em] text-brand">{Math.round(cropDomain.cropTransform.scale * 100)}%</span>
                  </div>
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
                  />
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={cropDomain.applyFitTransform} className="h-8 flex-1 rounded-full text-[11px] font-bold">Fit</Button>
                    <Button variant="outline" onClick={cropDomain.applyFillTransform} className="h-8 flex-1 rounded-full text-[11px] font-bold">Fill</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border/20 px-5 pb-5 pt-4 sm:px-6">
            <Button variant="ghost" onClick={cropDomain.closeCropDialog} disabled={cropDomain.cropBusy} className="h-10 rounded-full text-[12px] font-bold">
              Batal
            </Button>
            <Button
              onClick={() => void cropDomain.applyCrop()}
              disabled={cropDomain.cropBusy || !cropDomain.activeCropItem}
              className="h-10 rounded-full px-8 text-[12px] font-black tracking-wider shadow-sm"
            >
              {cropDomain.cropBusy ? "Memproses..." : "Selesai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
