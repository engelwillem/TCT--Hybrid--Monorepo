"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionBarButton } from "./ActionBarButton";

export type PageActionItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

type PageActionBarProps = {
  actions: PageActionItem[];
  className?: string;
};

export function PageActionBar({ actions, className }: PageActionBarProps) {
  if (!actions.length) return null;

  return (
    <div
      className={cn(
        "w-full rounded-[22px] bg-background/86 p-2 ring-1 ring-border/60 backdrop-blur-xl",
        "flex items-center gap-2",
        className
      )}
    >
      {actions.map((action) => (
        <ActionBarButton
          key={action.id}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
          disabled={action.disabled}
          variant={action.variant}
          className={cn(action.variant === "primary" ? "ml-auto" : "")}
        />
      ))}
    </div>
  );
}

