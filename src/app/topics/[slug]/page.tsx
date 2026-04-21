"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import {
  useManifest,
  useOverviewMetrics,
  useTopicConversations,
  useTopicQuestions,
} from "@/hooks/use-study-data";
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
import { ConditionBarChart } from "@/components/charts/condition-bar-chart";
import { RoundsCompareChart } from "@/components/charts/rounds-compare-chart";

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <Badge variant="accent" className="min-w-16 justify-center">
        Step {step}
      </Badge>
      <h2 className="text-2xl">{title}</h2>
    </div>
  );
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: manifest, isLoading: isManifestLoading, error: manifestError } = useManifest();
  const { data: questions, isLoading: isQuestionsLoading, error: questionsError } =
    useTopicQuestions(slug);
  const { data: conversations, isLoading: isConversationsLoading, error: conversationsError } =
    useTopicConversations(slug);
  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useOverviewMetrics();

  if (isManifestLoading || isQuestionsLoading || isConversationsLoading || isMetricsLoading) {
    return (
      <StateBox
        title="Loading topic..."
        message="Reading prompts, conversation snapshots, and chart metrics."
      />
    );
  }

  if (!manifest || !questions || !conversations || !metrics) {
    return (
      <StateBox
        title="Topic data unavailable"
        message={
          manifestError ??
          questionsError ??
          conversationsError ??
          metricsError ??
          "Could not load topic data."
        }
      />
    );
  }

  const topic = manifest.topics.find((item) => item.slug === slug);
  if (!topic) {
    return (
      <StateBox title="Topic not found" message={`No topic metadata found for "${slug}".`} />
    );
  }

  const topicMetrics = metrics.filter((metric) => metric.topicSlug === slug);
  const sampleQuestions = questions.slice(0, 5);
  const sampleConversation = conversations[0];

  return (
    <div className="grid gap-5">
      <section className="senate-panel colonnade p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
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

      <section className="senate-panel p-5 md:p-6">
        <StepHeader step={1} title="Topic Framing" />
        <p className="text-base text-[var(--muted-foreground)]">
          This section defines what this topic is trying to capture and what interpretation users
          should assign to a Yes response. All prompts in this topic are aligned to the same
          directional meaning so comparisons across conditions remain interpretable.
        </p>
      </section>

      <section className="senate-panel p-5 md:p-6">
        <StepHeader step={2} title="Representative Questions" />
        <div className="grid gap-3">
          {sampleQuestions.map((question, index) => (
            <Card key={question.id} className="bg-[var(--surface)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {index + 1}. {question.prompt}
                </CardTitle>
                <CardDescription>
                  Condition outcomes for this exact prompt in the current demo dataset.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-1 text-sm sm:grid-cols-2">
                {Object.entries(question.conditionSummary).map(([key, summary]) => (
                  <div
                    key={key}
                    className="rounded border border-[var(--line)] bg-[var(--card-muted)] px-2 py-1.5"
                  >
                    <span className="text-[var(--muted-foreground)]">
                      {CONDITION_LABELS[key as keyof typeof CONDITION_LABELS]}:
                    </span>{" "}
                    <strong>{summary.outcome}</strong>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="senate-panel p-5 md:p-6">
        <StepHeader step={3} title="Sample Debate Story" />
        {sampleConversation ? (
          <div className="grid gap-3">
            <Card className="bg-[var(--surface)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                {
                  sampleQuestions.find((item) => item.id === sampleConversation.questionId)
                    ?.prompt
                }
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-1.5">
              {sampleConversation.roleAssignments.map((assignment) => (
                <Badge key={assignment.agent} variant="subtle">
                  {assignment.agent}: {assignment.role}
                </Badge>
              ))}
            </div>
            <div className="grid gap-2">
              {sampleConversation.turns.map((turn, index) => (
                <Card key={`${turn.speaker}-${index}`} className="bg-[var(--surface)]">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                      {turn.speaker}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">{turn.text}</CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-[var(--surface)]">
              <CardContent className="pt-5 text-sm">
                Final consensus: <strong>{sampleConversation.finalConsensus}</strong> | Rounds:{" "}
                <strong>{sampleConversation.roundsCompleted}</strong>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-[var(--muted-foreground)]">No sample conversation found.</p>
        )}
      </section>

      <section className="senate-panel p-5 md:p-6">
        <StepHeader step={4} title="Visualization Snapshot" />
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          These charts summarize this topic only. In later iterations, these can be replaced by
          full production visualizations without changing this story layout.
        </p>
        <div className="grid gap-4 xl:grid-cols-2">
          <ConditionBarChart metrics={topicMetrics} title="Outcome Direction by Condition" />
          <RoundsCompareChart metrics={topicMetrics} />
        </div>
      </section>
    </div>
  );
}
