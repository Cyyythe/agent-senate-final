"use client";

import { useMemo } from "react";
import { useManifest, useOverviewMetrics } from "@/hooks/use-study-data";
import { useFilters } from "@/components/providers/filter-provider";
import { FilterPanel } from "@/components/filter-panel";
import { ConditionBarChart } from "@/components/charts/condition-bar-chart";
import { TopicHeatmap } from "@/components/charts/topic-heatmap";
import { RoundsCompareChart } from "@/components/charts/rounds-compare-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateBox } from "@/components/state-box";

export default function VisualizationsPage() {
  const { filters } = useFilters();
  const { data: manifest, isLoading: isManifestLoading, error: manifestError } = useManifest();
  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useOverviewMetrics();

  const filteredMetrics = useMemo(() => {
    if (!manifest || !metrics) return [];
    const topicBySlug = new Map(manifest.topics.map((topic) => [topic.slug, topic]));

    return metrics.filter((metric) => {
      const topic = topicBySlug.get(metric.topicSlug);
      if (!topic) return false;
      if (filters.topicSlug !== "all" && metric.topicSlug !== filters.topicSlug) return false;
      if (filters.spectrum !== "all" && topic.spectrum !== filters.spectrum) return false;
      return true;
    });
  }, [manifest, metrics, filters.topicSlug, filters.spectrum]);

  if (isManifestLoading || isMetricsLoading) {
    return <StateBox title="Loading visualizations..." message="Preparing chart datasets." />;
  }

  if (!manifest || !metrics || manifestError || metricsError) {
    return (
      <StateBox
        title="Visualization data unavailable"
        message={manifestError ?? metricsError ?? "Could not load metrics."}
      />
    );
  }

  const avgMindChanged =
    filteredMetrics.reduce((sum, metric) => sum + metric.anyMindChangedRate, 0) /
    Math.max(filteredMetrics.length, 1);

  return (
    <div className="grid gap-5">
      <section className="senate-panel p-6">
        <h1 className="text-3xl">Visualizations</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Placeholder-ready chart zone for milestone demo. Current chart components consume static
          JSON chunks and can be swapped to API responses later without page-level changes.
        </p>
      </section>

      <FilterPanel manifest={manifest} />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Topics</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{filteredMetrics.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Any-Mind-Change Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{avgMindChanged.toFixed(1)}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Data Mode</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">Static chunk manifest</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ConditionBarChart metrics={filteredMetrics} />
        <RoundsCompareChart metrics={filteredMetrics} />
      </section>

      <section>
        <TopicHeatmap metrics={filteredMetrics} />
      </section>
    </div>
  );
}
