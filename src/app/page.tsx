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
      <section className="forum-hero">
        <div className="forum-hero-content">
          <div>
            <Badge variant="accent" className="w-fit">
              Agent Senate
            </Badge>
            <h1 className="forum-title mt-4">Enter the Chamber</h1>
            <p className="forum-subtitle mt-4">
              Open a topic, read a few blind model answers, reveal the case, then compare the
              broader pattern across the full topic.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {manifest.topics.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </section>
    </div>
  );
}
