"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crop, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import type { CommunityUser } from "../types";
import { ComposerActionBar } from "./post-composer/ComposerActionBar";
import { ComposerInput } from "./post-composer/ComposerInput";
import { ComposerMediaStrip } from "./post-composer/ComposerMediaStrip";
import { ComposerShell } from "./post-composer/ComposerShell";
import { ComposerTypeChips } from "./post-composer/ComposerTypeChips";
import { clampCropTransform, type CropTransform, type PostComposerMetadata, type PostType } from "./post-composer/types";
import { usePostComposerState } from "./post-composer/usePostComposerState";
import { cn } from "@/lib/utils";

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

  const {
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
    activeCropItem,
    cropTransform,
    cropBusy,
    submitError,
    availableRatioPresets,
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
  } = usePostComposerState({
    onPost,
    initialText,
    initialType,
    initialExpanded,
  });

  const cropDragRef = useRef<{ pointerId: number; startX: number; startY: number; origin: CropTransform } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <ComposerShell isExpanded={isExpanded} className={className}>
        <div className="flex flex-col">
          <div className="px-6 pb-3 pt-8">
            <div className="mx-auto max-w-[26rem] space-y-1.5">
              <h2 className="tct-serif text-[24px] leading-[1.18] tracking-tight text-foreground/90">Ruang Berbagi</h2>
              <p className="max-w-[22rem] text-[13px] font-medium leading-relaxed tracking-[0.01em] text-foreground/55">
                Apa yang Tuhan taruh di hati Anda?
              </p>
            </div>
          </div>

          <ComposerInput value={text} isExpanded={isExpanded} onFocus={openComposer} onChange={updateText} />

          <ComposerMediaStrip
            hasImages={hasImages}
            images={images}
            previewUrls={previewUrls}
            composerMode={composerMode}
            mediaAspectRatio={mediaAspectRatio}
            onReopenCrop={reopenCropForImage}
            onSetCover={setImageAsCover}
            onMoveImage={moveImage}
            onRemoveImage={removeImage}
          />

          {isExpanded ? (
            <div className="space-y-4 px-6 pb-4">
              <ComposerTypeChips
                activePanel={activePanel}
                selectedTypeLabel={selectedTypeLabel}
                composerMode={composerMode}
                hasImages={hasImages}
                mediaAspectRatio={mediaAspectRatio}
                onTogglePanel={togglePanel}
              />

              <AnimatePresence initial={false} mode="wait">
                {activePanel === "media" ? (
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
                        const active = composerMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setMode(mode)}
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
                      {availableRatioPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => selectMediaAspectRatio(preset.value)}
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

                {activePanel === "category" ? (
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
                        onChange={(event) => setType(event.target.value as PostType)}
                        className="h-11 w-full appearance-none rounded-full border border-border/60 bg-white/90 px-4 pr-10 text-[13px] font-semibold text-foreground/80 outline-none transition focus:ring-2 focus:ring-sky-200/50"
                      >
                        {types.map((option) => (
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
                  void handleFilesSelected(event.target.files);
                  event.currentTarget.value = "";
                }}
              />

              {submitError ? (
                <p className="rounded-xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-[12px] font-semibold text-rose-700">
                  {submitError}
                </p>
              ) : null}

              <ComposerActionBar canSubmit={canSubmit} isSubmitting={isSubmitting} onCancel={resetComposer} onSubmit={() => void handleSubmit()} />
            </div>
          ) : null}
        </div>
      </ComposerShell>

      <Dialog open={!!activeCropItem} onOpenChange={(open) => (!open ? closeCropDialog() : null)}>
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
                  {availableRatioPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => selectMediaAspectRatio(preset.value)}
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
              </div>

              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_250px]">
                <div className="space-y-4">
                  <div
                    className={cn(
                      "relative mx-auto overflow-hidden rounded-[1.5rem] border border-border/60 bg-surface shadow-soft sm:rounded-[2rem]",
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

                <div className="space-y-4 rounded-[1.4rem] border border-border/50 bg-surface-muted/40 p-4 sm:rounded-[1.75rem]">
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
          <DialogFooter className="border-t border-border/50 bg-background px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 sm:px-6 sm:py-5">
            <Button type="button" variant="outline" onClick={closeCropDialog} disabled={cropBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="button" onClick={() => void applyCrop()} disabled={cropBusy || !activeCropItem} className="rounded-full">
              {cropBusy ? "Memproses..." : "Gunakan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
