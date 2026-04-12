import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ComposerAnalyticsBreakdownItem = {
  label: string;
  value: string;
  hint?: string;
};

type ComposerAnalyticsBreakdownProps = {
  title: string;
  items: ComposerAnalyticsBreakdownItem[];
};

export function ComposerAnalyticsBreakdown({ title, items }: ComposerAnalyticsBreakdownProps) {
  return (
    <Card className="border-border/70 bg-white/85">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="rounded-lg border border-border/60 bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground/80">{item.label}</span>
              <span className="text-sm font-black text-foreground">{item.value}</span>
            </div>
            {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
