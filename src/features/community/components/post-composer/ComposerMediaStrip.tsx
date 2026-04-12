import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComposerImage, ComposerMode, MediaAspectRatio } from "./types";
import { aspectRatioClass } from "./types";

type ComposerMediaStripProps = {
  hasImages: boolean;
  images: ComposerImage[];
  previewUrls: Record<string, string>;
  composerMode: ComposerMode;
  mediaAspectRatio: MediaAspectRatio;
  onReopenCrop: (image: ComposerImage) => void;
  onSetCover: (id: string) => void;
  onMoveImage: (id: string, direction: "left" | "right") => void;
  onRemoveImage: (id: string) => void;
};

export function ComposerMediaStrip({
  hasImages,
  images,
  previewUrls,
  composerMode,
  mediaAspectRatio,
  onReopenCrop,
  onSetCover,
  onMoveImage,
  onRemoveImage,
}: ComposerMediaStripProps) {
  if (!hasImages) return null;

  const coverImage = images[0] ?? null;
  const coverPreviewUrl = coverImage ? previewUrls[coverImage.id] : null;

  return (
    <div className="space-y-3 px-6 pb-5">
      <div className="rounded-[24px] border border-border/60 bg-background/92 p-2.5 shadow-soft">
        {coverImage && coverPreviewUrl ? (
          <button
            type="button"
            onClick={() => onReopenCrop(coverImage)}
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

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1.5 scrollbar-hide">
        {images.map((image, index) => {
          const url = previewUrls[image.id];
          if (!url) return null;
          const displayRatio = composerMode === "carousel" ? mediaAspectRatio : image.aspectRatio;
          const isCover = index === 0;

          return (
            <div
              key={image.id}
              className="group relative shrink-0 snap-start rounded-[20px] border border-border/60 bg-background/95 p-2 shadow-soft"
            >
              <button
                type="button"
                onClick={() => onReopenCrop(image)}
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
                  onClick={() => onReopenCrop(image)}
                  className="rounded-full border border-border/60 px-2 py-1.5 text-[10px] font-bold text-foreground/70 transition-colors hover:bg-surface-muted"
                >
                  Posisi
                </button>
                <button
                  type="button"
                  onClick={() => onSetCover(image.id)}
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
                  onClick={() => onMoveImage(image.id, "left")}
                  disabled={index === 0}
                  className="rounded-full border border-border/60 px-2 py-1.5 text-[10px] font-bold text-foreground/70 transition-colors hover:bg-surface-muted disabled:opacity-35"
                >
                  Kiri
                </button>
                <button
                  type="button"
                  onClick={() => onMoveImage(image.id, "right")}
                  disabled={index === images.length - 1}
                  className="rounded-full border border-border/60 px-2 py-1.5 text-[10px] font-bold text-foreground/70 transition-colors hover:bg-surface-muted disabled:opacity-35"
                >
                  Kanan
                </button>
              </div>
              <button
                type="button"
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-md transition-colors hover:bg-black/80"
                onClick={() => onRemoveImage(image.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
