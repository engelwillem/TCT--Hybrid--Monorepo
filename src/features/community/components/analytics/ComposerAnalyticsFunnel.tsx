import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComposerAnalyticsFunnelStage } from "../../analytics/types";

type ComposerAnalyticsFunnelProps = {
  stages: ComposerAnalyticsFunnelStage[];
};

export function ComposerAnalyticsFunnel({ stages }: ComposerAnalyticsFunnelProps) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <Card className="border-border/70 bg-white/85">
      <CardHeader>
        <CardTitle>Session Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>{stage.label}</span>
              <span>{stage.value.toLocaleString()} ({stage.rateFromPreviousPct}%)</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/70">
              <div
                className={cn("h-full rounded-full bg-sky-500 transition-all", stage.key === "success" ? "bg-emerald-500" : "")}
                style={{ width: `${Math.max(4, (stage.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
