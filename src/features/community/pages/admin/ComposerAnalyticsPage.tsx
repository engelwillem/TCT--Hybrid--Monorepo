"use client";

import { useEffect, useMemo, useState } from "react";
import { ComposerAnalyticsBreakdown } from "../../components/analytics/ComposerAnalyticsBreakdown";
import { ComposerAnalyticsFilters } from "../../components/analytics/ComposerAnalyticsFilters";
import { ComposerAnalyticsFunnel } from "../../components/analytics/ComposerAnalyticsFunnel";
import { ComposerAnalyticsInsightList } from "../../components/analytics/ComposerAnalyticsInsightList";
import { ComposerAnalyticsMetricCard } from "../../components/analytics/ComposerAnalyticsMetricCard";
import { defaultComposerFilters } from "../../analytics/selectors";
import { getComposerAnalytics } from "../../analytics/service";
import type { ComposerAnalyticsFilters as ComposerFilters, ComposerAnalyticsSnapshot } from "../../analytics/types";
import { Card, CardContent } from "@/components/ui/card";

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function ComposerAnalyticsPage() {
  const [filters, setFilters] = useState<ComposerFilters>(defaultComposerFilters("7d"));
  const [snapshot, setSnapshot] = useState<ComposerAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void getComposerAnalytics(filters).then((data) => {
      if (!active) return;
      setSnapshot(data);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [filters]);

  const postTypeBreakdownItems = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.postTypeBreakdown.map((item) => ({
      label: item.postType,
      value: formatPercent(item.successRatePct),
      hint: `${item.submitSuccessCount.toLocaleString()} sukses dari ${item.openCount.toLocaleString()} open`,
    }));
  }, [snapshot]);

  const validationItems = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.failure.topValidationFailures.map((item) => ({
      label: item.reason,
      value: item.count.toLocaleString(),
      hint: "Dalam periode/filter terpilih",
    }));
  }, [snapshot]);

  if (loading || !snapshot) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Memuat analytics composer...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground">PostComposer Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Pantau activation, continuity draft, friksi, dan pola keberhasilan posting komunitas.
        </p>
      </section>

      <ComposerAnalyticsFilters value={filters} onChange={setFilters} />

      <section className="grid gap-3 md:grid-cols-3">
        <ComposerAnalyticsMetricCard
          label="Meaningful Activation Rate"
          value={formatPercent(snapshot.overview.meaningfulActivationRatePct)}
          hint="Open composer -> submit sukses"
        />
        <ComposerAnalyticsMetricCard
          label="Open to Success"
          value={formatPercent(snapshot.overview.openToSuccessRatePct)}
          hint={`${snapshot.overview.submitSuccessCount.toLocaleString()} sukses dari ${snapshot.overview.openCount.toLocaleString()} open`}
        />
        <ComposerAnalyticsMetricCard
          label="Average Time to Post"
          value={`${snapshot.overview.averageTimeToPostSec.toFixed(1)}s`}
          hint="Rata-rata waktu hingga submit"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ComposerAnalyticsFunnel stages={snapshot.funnel} />
        <ComposerAnalyticsBreakdown
          title="Draft Behavior"
          items={[
            {
              label: "Draft Restore Rate",
              value: formatPercent(snapshot.draft.restoreRatePct),
              hint: `${snapshot.draft.restoredCount.toLocaleString()} sesi restore`,
            },
            {
              label: "Restore -> Success",
              value: formatPercent(snapshot.draft.restoredToSuccessRatePct),
              hint: "Sesi restore yang berakhir submit sukses",
            },
            {
              label: "Abandoned Draft Ratio",
              value: formatPercent(snapshot.draft.abandonedDraftRatioPct),
              hint: "Draft restore yang tidak lanjut diposting",
            },
          ]}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ComposerAnalyticsBreakdown
          title="Media Impact"
          items={[
            {
              label: "Media Attachment Rate",
              value: formatPercent(snapshot.media.attachmentRatePct),
              hint: "Proporsi sesi open yang attach media",
            },
            {
              label: "Media Success Rate",
              value: formatPercent(snapshot.media.mediaSuccessRatePct),
              hint: "Attempt dengan media yang sukses",
            },
            {
              label: "Text-only Success Rate",
              value: formatPercent(snapshot.media.textOnlySuccessRatePct),
              hint: "Attempt tanpa media yang sukses",
            },
            {
              label: "Crop Interaction Density",
              value: snapshot.media.cropInteractionDensity.toFixed(2),
              hint: "Rata-rata aksi crop per attach media",
            },
          ]}
        />
        <ComposerAnalyticsBreakdown title="Failure & Friction" items={validationItems} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ComposerAnalyticsBreakdown title="Post Type Breakdown" items={postTypeBreakdownItems} />
        <ComposerAnalyticsInsightList insights={snapshot.insights} />
      </section>
    </main>
  );
}
