"use client";

import { RotateCcw } from "lucide-react";
import { useFilters } from "@/components/providers/filter-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AGENT_ORDER } from "@/lib/constants";
import { type DataManifest } from "@/lib/types";

interface FilterPanelProps {
  manifest: DataManifest | null;
}

export function FilterPanel({ manifest }: FilterPanelProps) {
  const { filters, setFilter, resetFilters } = useFilters();
  const topicOptions = manifest?.topics ?? [];
  const spectrumOptions = Array.from(
    new Set(topicOptions.map((topic) => topic.spectrum))
  ).sort((a, b) => a.localeCompare(b));
  const roleOptions = manifest?.roleMap ? Object.values(manifest.roleMap) : [];

  return (
    <Card className="border-[var(--line)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <label className="grid gap-1.5 text-xs font-medium">
          Run Mode
          <select
            value={filters.runMode}
            onChange={(event) => setFilter("runMode", event.target.value as typeof filters.runMode)}
            className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm"
          >
            <option value="all">All</option>
            <option value="single">Single</option>
            <option value="debate">Debate</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium">
          Role Toggle
          <select
            value={filters.roleMode}
            onChange={(event) => setFilter("roleMode", event.target.value as typeof filters.roleMode)}
            className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm"
          >
            <option value="all">All</option>
            <option value="role">Role</option>
            <option value="no-role">No Role</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium">
          Spectrum Topic
          <select
            value={filters.spectrum}
            onChange={(event) =>
              setFilter("spectrum", event.target.value as typeof filters.spectrum)
            }
            className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm"
          >
            <option value="all">All</option>
            {spectrumOptions.map((spectrum) => (
              <option key={spectrum} value={spectrum}>
                {spectrum}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium">
          Topic
          <select
            value={filters.topicSlug}
            onChange={(event) =>
              setFilter("topicSlug", event.target.value as typeof filters.topicSlug)
            }
            className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm"
          >
            <option value="all">All</option>
            {topicOptions.map((topic) => (
              <option key={topic.slug} value={topic.slug}>
                {topic.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium">
          AI Agent
          <select
            value={filters.agent}
            onChange={(event) => setFilter("agent", event.target.value as typeof filters.agent)}
            className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm"
          >
            <option value="all">All</option>
            {AGENT_ORDER.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs font-medium">
          Role
          <select
            value={filters.role}
            onChange={(event) => setFilter("role", event.target.value as typeof filters.role)}
            className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm"
          >
            <option value="all">All</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </CardContent>
    </Card>
  );
}
