import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComposerAnalyticsInsight } from "../../analytics/types";

type ComposerAnalyticsInsightListProps = {
  insights: ComposerAnalyticsInsight[];
};

const TONE_LABEL: Record<ComposerAnalyticsInsight["tone"], string> = {
  neutral: "Observe",
  positive: "Opportunity",
  warning: "Action Needed",
};

const TONE_CLASS: Record<ComposerAnalyticsInsight["tone"], string> = {
  neutral: "bg-slate-100 text-slate-700",
  positive: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
};

export function ComposerAnalyticsInsightList({ insights }: ComposerAnalyticsInsightListProps) {
  return (
    <Card className="border-border/70 bg-white/85">
      <CardHeader>
        <CardTitle>Actionable Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="rounded-lg border border-border/60 bg-white px-3 py-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{insight.title}</p>
              <Badge className={TONE_CLASS[insight.tone]}>{TONE_LABEL[insight.tone]}</Badge>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
