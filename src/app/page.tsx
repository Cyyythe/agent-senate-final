"use client";

import { useManifest } from "@/hooks/use-study-data";
import { Badge } from "@/components/ui/badge";
import { StateBox } from "@/components/state-box";
import { TopicCard } from "@/components/topic-card";

export default function HomePage() {
  const { data: manifest, isLoading, error } = useManifest();

  if (isLoading) {
    return <StateBox title="Loading app data..." message="Reading topic index." />;
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
      <section className="senate-panel colonnade p-7 md:p-8">
        <Badge variant="accent" className="w-fit">
          Milestone 3 Demo
        </Badge>
        <h1 className="mt-3 text-3xl leading-tight md:text-4xl">
          Choose a Topic and Work Through the Question
        </h1>
        <p className="mt-3 max-w-4xl text-lg text-[var(--muted-foreground)]">
          Each topic unfolds as its own guided story: a first lean, a concrete anchor case,
          harder variants, evidence, debate, and local feedback checkpoints along the way.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {manifest.topics.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </section>
    </div>
  );
}
