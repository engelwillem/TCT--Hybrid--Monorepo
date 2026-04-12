import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ComposerAnalyticsMetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function ComposerAnalyticsMetricCard({ label, value, hint }: ComposerAnalyticsMetricCardProps) {
  return (
    <Card className="border-border/70 bg-white/85">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
