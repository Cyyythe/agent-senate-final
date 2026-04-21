"use client";

import Link from "next/link";
import { ArrowRight, BookMarked, ChartColumnIncreasing, Compass } from "lucide-react";
import { useManifest } from "@/hooks/use-study-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicCard } from "@/components/topic-card";
import { StateBox } from "@/components/state-box";

export default function HomePage() {
  const { data: manifest, isLoading, error } = useManifest();

  if (isLoading) {
    return <StateBox title="Loading app data..." message="Reading manifest and topic index." />;
  }

  if (error || !manifest) {
    return (
      <StateBox
        title="Could not load the data manifest"
        message={error ?? "The app could not read /public/data/manifest.json"}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <section className="senate-panel colonnade overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr]">
          <div className="grid gap-4">
            <Badge variant="accent" className="w-fit">
              Milestone 3 Demo
            </Badge>
            <h1 className="text-3xl leading-tight md:text-4xl">
              Explore How LLM Judgments Shift Across Roles, Debate, and Tradeoff Topics
            </h1>
            <p className="max-w-3xl text-lg text-[var(--muted-foreground)]">
              This proof-of-concept is designed for guided exploration: start from a question
              family, inspect examples, compare conditions, and evaluate where model behavior is
              stable versus framing-sensitive.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/topics">
                  Open Topic Stories <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/visualizations">
                  See Visualizations <ChartColumnIncreasing className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Demo Focus</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p>
                <span className="font-semibold">Primary requirement:</span> make questions the
                center of the experience and let users progressively inspect evidence.
              </p>
              <p>
                <span className="font-semibold">Current mode:</span> client-side static JSON chunks
                with scalable manifest indexing.
              </p>
              <p>
                <span className="font-semibold">Feedback flow:</span> non-invasive dock with local
                export and perception-gap Likert collection.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="h-4 w-4" /> Topic-led flow
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Start at one tradeoff topic, inspect its definition and sample questions, then expand
            to condition-level visual summaries.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartColumnIncreasing className="h-4 w-4" /> Filter-heavy analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Slice data by role/no-role, single/debate, agent, and spectrum topic to identify
            interpretable shifts.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookMarked className="h-4 w-4" /> Research narrative
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Each route supports a story format: introduction, representative prompt examples,
            evidence snapshots, and user reflection.
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Topic Entry Points</h2>
          <Button asChild variant="outline">
            <Link href="/topics">View All Topics</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {manifest.topics.slice(0, 6).map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  );
}
