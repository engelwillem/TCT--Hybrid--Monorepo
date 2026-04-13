'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * LandingAnimationShell
 * Applies a staggered "fade up" entrance animation to each child
 * element that has a `data-animate` attribute, without requiring
 * any animation library (pure CSS + minimal JS).
 */
export default function LandingAnimationShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>('[data-animate]');
    targets.forEach((el, i) => {
      // Start hidden
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms,
                             transform 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms`;

      // Trigger on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}
