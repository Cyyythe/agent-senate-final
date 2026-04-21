"use client";

import { useManifest } from "@/hooks/use-study-data";
import { TopicCard } from "@/components/topic-card";
import { StateBox } from "@/components/state-box";

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
      <section className="senate-panel p-6">
        <h1 className="text-3xl">Question Families</h1>
        <p className="mt-2 max-w-4xl text-[var(--muted-foreground)]">
          Topics are intentionally narrow tradeoff axes. Each topic page introduces the axis, shows
          representative prompt examples, and previews debate traces for interpretation.
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
