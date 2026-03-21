import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TCTLogoProps extends React.SVGProps<SVGSVGElement> {}

/**
 * TCTLogo is the primary brand identity for The Chosen Talks.
 * It strictly maintains the gradient identity of the brand and is highly optimized.
 */
export function TCTLogo({ className, ...props }: TCTLogoProps) {
  // Using useId ensures that if multiple logos are rendered on the same page,
  // the gradient IDs don't collide and break SVG rendering.
  const gradientId = React.useId();

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38E0FF" />
          <stop offset="100%" stopColor="#00A9D6" />
        </linearGradient>
      </defs>

      {/* Main T */}
      <rect x="116" y="150" width="280" height="70" rx="14" fill={`url(#${gradientId})`} />
      <rect x="221" y="150" width="70" height="220" rx="14" fill={`url(#${gradientId})`} />

      {/* Dot */}
      <circle cx="380" cy="350" r="26" fill={`url(#${gradientId})`} />
    </svg>
  );
}
