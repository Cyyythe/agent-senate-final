"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useManifest, useTopicConversations, useTopicQuestions } from "@/hooks/use-study-data";
import { CONDITION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StateBox } from "@/components/state-box";

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: manifest, isLoading: isManifestLoading, error: manifestError } = useManifest();
  const { data: questions, isLoading: isQuestionsLoading } = useTopicQuestions(slug);
  const { data: conversations, isLoading: isConversationsLoading } =
    useTopicConversations(slug);

  const topic = useMemo(
    () => manifest?.topics.find((item) => item.slug === slug) ?? null,
    [manifest, slug]
  );

  if (isManifestLoading || isQuestionsLoading || isConversationsLoading) {
    return <StateBox title="Loading topic..." message="Reading prompts and sample conversations." />;
  }

  if (!topic || manifestError) {
    return (
      <StateBox
        title="Topic not found"
        message={manifestError ?? `No topic metadata found for "${slug}".`}
      />
    );
  }

  const sampleQuestions = (questions ?? []).slice(0, 5);
  const sampleConversation = (conversations ?? [])[0];

  return (
    <div className="grid gap-5">
      <section className="senate-panel colonnade p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-2">
            <Badge variant="accent" className="w-fit">
              {topic.spectrum}
            </Badge>
            <h1 className="text-3xl">{topic.title}</h1>
            <p className="max-w-4xl text-[var(--muted-foreground)]">{topic.definition}</p>
            <p className="text-sm">
              <span className="font-semibold">Yes means:</span> {topic.yesMeans}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/topics">
              <ArrowLeft className="h-4 w-4" />
              Back to Topics
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Representative Questions</CardTitle>
            <CardDescription>
              Questions are designed so each Yes/No/Maybe response has a stable interpretation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {sampleQuestions.map((question, index) => (
              <div key={question.id} className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-3">
                <p className="font-medium">
                  {index + 1}. {question.prompt}
                </p>
                <div className="mt-2 grid gap-1 text-xs text-[var(--muted-foreground)] sm:grid-cols-2">
                  {Object.entries(question.conditionSummary).map(([key, summary]) => (
                    <span key={key}>
                      {CONDITION_LABELS[key as keyof typeof CONDITION_LABELS]}:{" "}
                      <strong className="text-[var(--foreground)]">{summary.outcome}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Debate Trace</CardTitle>
            <CardDescription>
              Story-style view to keep question interpretation central to the user flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {sampleConversation ? (
              <>
                <p className="rounded-md bg-[var(--card-muted)] p-3 font-medium">
                  Prompt:{" "}
                  {sampleQuestions.find((item) => item.id === sampleConversation.questionId)?.prompt}
                </p>
                <div className="flex flex-wrap gap-1">
                  {sampleConversation.roleAssignments.map((assignment) => (
                    <Badge key={assignment.agent} variant="subtle">
                      {assignment.agent}: {assignment.role}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-2">
                  {sampleConversation.turns.map((turn, index) => (
                    <div key={`${turn.speaker}-${index}`} className="rounded-md border border-[var(--line)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        {turn.speaker}
                      </p>
                      <p>{turn.text}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-3">
                  Final consensus: <strong>{sampleConversation.finalConsensus}</strong> | Rounds:{" "}
                  <strong>{sampleConversation.roundsCompleted}</strong>
                </div>
              </>
            ) : (
              <p className="text-[var(--muted-foreground)]">
                Conversation placeholder missing for this topic.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
