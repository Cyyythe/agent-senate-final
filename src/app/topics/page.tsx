"use client";

import { useManifest } from "@/hooks/use-study-data";
import { TopicCard } from "@/components/topic-card";
import { StateBox } from "@/components/state-box";
import { Badge } from "@/components/ui/badge";

const PATH_STEPS = [
  {
    title: "First lean",
    detail: "Ask for the user's starting position before evidence appears.",
  },
  {
    title: "Anchor case",
    detail: "Ground the broad value conflict in one concrete prompt.",
  },
  {
    title: "Evidence",
    detail: "Show how the answer moves across conditions and role setups.",
  },
  {
    title: "Reflection",
    detail: "Collect whether the story changed the user's read.",
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
          Topic Stories
        </Badge>
        <h1 className="mt-3 text-3xl">Question Families</h1>
        <p className="mt-2 max-w-4xl text-[var(--muted-foreground)]">
          Pick any topic. Inside each page, the user is eased into one value question, shown
          evidence step by step, and asked for feedback as their interpretation changes.
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
