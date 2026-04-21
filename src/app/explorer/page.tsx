"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useAllQuestions, useManifest } from "@/hooks/use-study-data";
import { useFilters } from "@/components/providers/filter-provider";
import { FilterPanel } from "@/components/filter-panel";
import { CONDITION_LABELS } from "@/lib/constants";
import { type ConditionKey } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StateBox } from "@/components/state-box";

function pickVisibleConditions(
  runMode: "all" | "single" | "debate",
  roleMode: "all" | "role" | "no-role"
) {
  const keys = Object.keys(CONDITION_LABELS) as ConditionKey[];
  return keys.filter((condition) => {
    const runMatch =
      runMode === "all" ||
      (runMode === "single" && condition.startsWith("single")) ||
      (runMode === "debate" && condition.startsWith("debate"));
    const roleMatch =
      roleMode === "all" ||
      (roleMode === "role" && (condition === "single_role" || condition === "debate_role")) ||
      (roleMode === "no-role" &&
        (condition === "single_no_role" || condition === "debate_no_role"));
    return runMatch && roleMatch;
  });
}

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const { filters } = useFilters();
  const { data: manifest, isLoading: isManifestLoading, error: manifestError } = useManifest();
  const { data: questions, isLoading: isQuestionsLoading, error: questionsError } =
    useAllQuestions();

  if (isManifestLoading || isQuestionsLoading) {
    return <StateBox title="Loading explorer..." message="Preparing question records." />;
  }

  if (!manifest || !questions || manifestError || questionsError) {
    return (
      <StateBox
        title="Explorer data unavailable"
        message={manifestError ?? questionsError ?? "Could not load question records."}
      />
    );
  }

  const topicBySlug = new Map(manifest.topics.map((topic) => [topic.slug, topic]));
  const visibleConditions = pickVisibleConditions(filters.runMode, filters.roleMode);

  const filtered = questions.filter((question) => {
    const topic = topicBySlug.get(question.topicSlug);
    if (!topic) return false;
    if (filters.topicSlug !== "all" && question.topicSlug !== filters.topicSlug) return false;
    if (filters.spectrum !== "all" && topic.spectrum !== filters.spectrum) return false;
    if (
      query.trim().length > 0 &&
      !question.prompt.toLowerCase().includes(query.trim().toLowerCase())
    ) {
      return false;
    }

    if (filters.agent !== "all" || filters.role !== "all") {
      const activeAgent = filters.agent === "all" ? null : filters.agent;
      const activeRole = filters.role === "all" ? null : filters.role;
      const roleMap = manifest.roleMap;

      const hasMatchingAgent = visibleConditions.some((condition) => {
        const entries = Object.entries(question.agentVotes[condition]);
        return entries.some(([agentName]) => {
          const agentMatches = activeAgent ? agentName === activeAgent : true;
          const roleMatches = activeRole ? roleMap[agentName as keyof typeof roleMap] === activeRole : true;
          return agentMatches && roleMatches;
        });
      });
      if (!hasMatchingAgent) return false;
    }

    return true;
  });

  return (
    <div className="grid gap-5">
      <section className="senate-panel p-6">
        <h1 className="text-3xl">Question Explorer</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Filter by condition, spectrum topic, AI agent, and role to inspect how outcomes move per
          prompt.
        </p>
      </section>

      <FilterPanel manifest={manifest} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search question text..."
            />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <p className="text-sm text-[var(--muted-foreground)]">
          Showing <strong>{filtered.length}</strong> of <strong>{questions.length}</strong> prompts
          after filters.
        </p>
        {filtered.map((question) => {
          const topic = topicBySlug.get(question.topicSlug);
          return (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{topic?.spectrum ?? "Unknown spectrum"}</Badge>
                  <Badge variant="subtle">{topic?.title ?? question.topicSlug}</Badge>
                </div>
                <CardTitle className="text-base">{question.prompt}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {visibleConditions.map((condition) => {
                  const summary = question.conditionSummary[condition];
                  const agentAnswer =
                    filters.agent === "all"
                      ? null
                      : question.agentVotes[condition][filters.agent];
                  return (
                    <div
                      key={`${question.id}-${condition}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] p-2"
                    >
                      <span className="font-medium">{CONDITION_LABELS[condition]}</span>
                      <div className="flex items-center gap-2">
                        {agentAnswer ? (
                          <Badge variant="default">{filters.agent}: {agentAnswer}</Badge>
                        ) : null}
                        <Badge variant={summary.outcome === "Yes" ? "accent" : "default"}>
                          Outcome: {summary.outcome}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
