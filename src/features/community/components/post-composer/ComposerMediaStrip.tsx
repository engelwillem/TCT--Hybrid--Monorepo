import { Star, X, Settings2, GripVertical, ImagePlus } from "lucide-react";
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
  onAddImageContextual: () => void;
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
  onAddImageContextual,
}: ComposerMediaStripProps) {
  if (!hasImages) return null;

  return (
    <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pb-4 pt-1 scrollbar-hide">
      {images.map((image, index) => {
        const url = previewUrls[image.id];
        if (!url) return null;
        const displayRatio = composerMode === "carousel" ? mediaAspectRatio : image.aspectRatio;
        const isCover = index === 0;

        return (
          <div
            key={image.id}
            className="group relative shrink-0 snap-start"
          >
            <button
              type="button"
              onClick={() => onReopenCrop(image)}
              className={cn(
                "relative block w-28 overflow-hidden rounded-[18px] bg-slate-100 shadow-sm ring-1 ring-border/50 transition-all hover:ring-2 hover:ring-brand",
                aspectRatioClass(displayRatio)
              )}
            >
              <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              {isCover ? (
                <div className="absolute bottom-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md">
                  <Star className="h-3 w-3 fill-current" />
                </div>
              ) : null}
            </button>
            
             {/* Quick Context Action - Appears on hover for desktop, persistent for mobile */}
            <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(image.id);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/90"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}

      {images.length > 0 && images.length < 5 && (
        <button
          type="button"
          onClick={onAddImageContextual}
          className="flex w-16 shrink-0 snap-start items-center justify-center rounded-[18px] border-2 border-dashed border-border/60 bg-surface-muted/50 text-foreground/40 transition-colors hover:bg-surface-muted hover:text-foreground/70"
          aria-label="Add more media"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
