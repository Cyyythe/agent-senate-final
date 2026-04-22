"use client";

import { useManifest } from "@/hooks/use-study-data";
import { TopicCard } from "@/components/topic-card";
import { StateBox } from "@/components/state-box";
import { Badge } from "@/components/ui/badge";

const PATH_STEPS = [
  {
    title: "Answer first",
    detail: "Start with your own read.",
  },
  {
    title: "Check cases",
    detail: "Move through a few concrete versions.",
  },
  {
    title: "Compare runs",
    detail: "See where the model answers changed.",
  },
  {
    title: "Save notes",
    detail: "Record what shifted, if anything.",
  },
];

export default function TopicsPage() {
  const { data: manifest, isLoading, error } = useManifest();

  if (isLoading) {
    return <StateBox title="Loading topics..." message="Building the topic index." />;
  }

  if (error || !manifest) {
    return (
      <StateBox
        title="Unable to load topics"
        message={error ?? "Could not read manifest topic definitions."}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <section className="senate-panel colonnade p-6 md:p-7">
        <Badge variant="accent" className="w-fit">
          Topics
        </Badge>
        <h1 className="mt-3 text-3xl">Pick a Question</h1>
        <p className="mt-2 max-w-4xl text-[var(--muted-foreground)]">
          Each topic opens as a short card deck. Answer first, review the cases, compare the
          model runs, and save a note before moving on.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PATH_STEPS.map((step, index) => (
          <div
            key={step.title}
            className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-[var(--card-muted)] font-serif font-semibold">
              {index + 1}
            </div>
            <h2 className="font-serif text-lg font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{step.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {manifest.topics.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </section>
    </div>
  );
}
