import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    // Simple vibration patterns as a fallback/standard for web haptics
    const pattern = style === 'heavy' ? [20] : style === 'medium' ? [15] : [10];
    window.navigator.vibrate(pattern);
  }
}
