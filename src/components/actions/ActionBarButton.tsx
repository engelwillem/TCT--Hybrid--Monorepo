"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ActionBarButtonVariant = "primary" | "secondary" | "ghost";

type ActionBarButtonProps = {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: ActionBarButtonVariant;
  className?: string;
  type?: "button" | "submit";
};

export function ActionBarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = "secondary",
  className,
  type = "button",
}: ActionBarButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-all",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" &&
          "bg-foreground text-background shadow-[0_6px_22px_rgba(15,23,42,0.14)] hover:opacity-95 active:scale-[0.98]",
        variant === "secondary" &&
          "bg-surface-muted/80 text-foreground/75 ring-1 ring-border/60 hover:bg-surface-muted",
        variant === "ghost" &&
          "bg-transparent text-foreground/55 hover:text-foreground/75",
        className
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{label}</span>
    </button>
  );
}

