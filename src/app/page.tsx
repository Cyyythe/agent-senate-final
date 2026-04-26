"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import { ArrowRight, Landmark } from "lucide-react";
import { useManifest } from "@/hooks/use-study-data";
import { Badge } from "@/components/ui/badge";
import { StateBox } from "@/components/state-box";
import { type TopicDescriptor } from "@/lib/types";

const SEAT_OFFSETS = [
  { y: 3.2, rotate: -7 },
  { y: 1.4, rotate: -4 },
  { y: 0.2, rotate: -1 },
  { y: 1.4, rotate: 4 },
  { y: 3.2, rotate: 7 },
  { y: 2.4, rotate: -5 },
  { y: 0.8, rotate: -2 },
  { y: 0.4, rotate: 0 },
  { y: 0.8, rotate: 2 },
  { y: 2.4, rotate: 5 },
] as const;

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function getShortTitle(title: string) {
  return title.replaceAll(" vs ", " / ");
}

function getSeatStyle(index: number) {
  const offset = SEAT_OFFSETS[index % SEAT_OFFSETS.length];
  return {
    "--seat-y": `${offset.y}rem`,
    "--seat-rotate": `${offset.rotate}deg`,
    "--seat-delay": `${index * 45}ms`,
  } as CSSProperties;
}

function SenateTopicForum({ topics }: { topics: TopicDescriptor[] }) {
  return (
    <section className="senate-topic-forum" aria-labelledby="topic-forum-title">
      <div className="forum-dais">
        <div className="forum-dais-mark" aria-hidden="true">
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-[var(--accent-strong)]">
            {topics.length} chambers
          </div>
          <h2 id="topic-forum-title" className="text-2xl">
            Choose a Seat
          </h2>
        </div>
      </div>

      <div className="topic-seat-grid">
        {topics.map((topic, index) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="senate-topic-seat"
            style={getSeatStyle(index)}
          >
            <span className="seat-index">{ROMAN_NUMERALS[index] ?? index + 1}</span>
            <span className="seat-spectrum">{topic.spectrum}</span>
            <strong>{getShortTitle(topic.title)}</strong>
            <span className="seat-meta">
              {topic.questionCount} prompts <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

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
    <div className="page-enter grid gap-6">
      <section className="forum-hero home-hero">
        <div className="forum-hero-content">
          <div>
            <Badge variant="accent" className="w-fit">
              Agent Senate
            </Badge>
            <h1 className="forum-title mt-4">Agent Senate</h1>
            <p className="forum-subtitle mt-4">
              A guided chamber for testing where models line up, split, and change their minds.
              Start blind, reveal the case, then judge the evidence.
            </p>
          </div>
          <div className="senate-seal" aria-hidden="true">
            AS
          </div>
        </div>
      </section>

      <SenateTopicForum topics={manifest.topics} />
    </div>
  );
}
