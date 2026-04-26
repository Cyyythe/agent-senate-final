"use client";

import { useManifest } from "@/hooks/use-study-data";
import { TopicCard } from "@/components/topic-card";
import { StateBox } from "@/components/state-box";
import { Badge } from "@/components/ui/badge";

const PATH_STEPS = [
  {
    title: "Read blind answers",
    detail: "See the model reasoning before the case.",
  },
  {
    title: "Reveal the case",
    detail: "Then compare the prompt against the answers.",
  },
  {
    title: "Inspect one debate",
    detail: "Watch one disagreement unfold round by round.",
  },
  {
    title: "Check the full topic",
    detail: "Step back to the larger pattern.",
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
    <div className="page-enter grid gap-5">
      <section className="forum-hero">
        <div className="forum-hero-content">
          <div>
            <Badge variant="accent" className="w-fit">
              Topics
            </Badge>
            <h1 className="forum-title mt-4">Choose a Chamber</h1>
            <p className="forum-subtitle mt-4">
              Each topic is a short session. Make an early call, uncover the prompt, watch one
              debate, then step back to the full pattern.
            </p>
          </div>
          <div className="senate-seal" aria-hidden="true">
            AS
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PATH_STEPS.map((step, index) => (
          <div
            key={step.title}
            className="topic-card rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 pt-5 shadow-sm"
          >
            <div className="roman-index mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] font-serif font-semibold">
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
