"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CommunityImageCarouselProps = {
  images: string[];
  altBase?: string;
  aspectRatio?: "4:5" | "og" | "auto";
  className?: string;
};

export function CommunityImageCarousel({
  images,
  altBase = "Community image",
  aspectRatio = "auto",
  className,
}: CommunityImageCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;

  const ratioClass = useMemo(() => {
    if (aspectRatio === "4:5") return "aspect-[4/5]";
    if (aspectRatio === "og") return "aspect-[1.91/1]";
    return "aspect-[1.08/1]";
  }, [aspectRatio]);

  const updateActiveByScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const width = scroller.clientWidth || 1;
    const nextIndex = Math.round(scroller.scrollLeft / width);
    const bounded = Math.max(0, Math.min(total - 1, nextIndex));
    if (bounded !== activeIndex) {
      setActiveIndex(bounded);
    }
  }, [activeIndex, total]);

  if (total === 0) return null;

  if (total === 1) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl ring-1 ring-border/60 bg-surface-muted",
          ratioClass,
          className
        )}
      >
        <img
          src={images[0]}
          alt={altBase}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        onScroll={updateActiveByScroll}
        className={cn(
          "relative flex overflow-x-auto scroll-smooth snap-x snap-mandatory touch-pan-x",
          "rounded-2xl ring-1 ring-border/60 bg-surface-muted scrollbar-hide",
          ratioClass
        )}
      >
        {images.map((src, idx) => (
          <div key={`${src}-${idx}`} className="h-full w-full shrink-0 snap-start">
            <img
              src={src}
              alt={`${altBase} ${idx + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
        {images.map((_, idx) => (
          <span
            key={`dot-${idx}`}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors duration-200",
              idx === activeIndex ? "bg-white/88" : "bg-white/45"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

