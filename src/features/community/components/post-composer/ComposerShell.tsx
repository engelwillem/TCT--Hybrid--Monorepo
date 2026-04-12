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
        "relative flex min-h-[140px] flex-col overflow-hidden rounded-[36px] border-0 bg-white shadow-[0_24px_68px_-20px_rgba(15,23,42,0.18)] transition-all duration-500 md:rounded-[42px]",
        isExpanded ? "ring-1 ring-border/50" : "",
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col p-0">{children}</CardContent>
    </Card>
  );
}
