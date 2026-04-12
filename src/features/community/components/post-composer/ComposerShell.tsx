import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ComposerShellProps = {
  isExpanded: boolean;
  className?: string;
  children: ReactNode;
};

export function ComposerShell({ isExpanded, className, children }: ComposerShellProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[30px] border border-border/60 bg-surface/90 shadow-premium backdrop-blur-2xl transition-all duration-500",
        isExpanded ? "ring-2 ring-sky-200/45" : "",
        className
      )}
    >
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
