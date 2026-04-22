"use client";

import Link from "next/link";
import { use, useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  MessageSquareText,
  Scale,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import {
  useManifest,
  useOverviewMetrics,
  useTopicConversations,
  useTopicQuestions,
} from "@/hooks/use-study-data";
import { CONDITION_LABELS } from "@/lib/constants";
import {
  type AnswerValue,
  type ConversationItem,
  type QuestionItem,
  type TopicMetric,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StateBox } from "@/components/state-box";
import { ConditionBarChart } from "@/components/charts/condition-bar-chart";
import { RoundsCompareChart } from "@/components/charts/rounds-compare-chart";
import { TopicFeedbackCheckpoint } from "@/components/topic-feedback-checkpoint";

type ConditionLabel = keyof TopicMetric["yesRateByCondition"];

const CONDITION_ORDER: ConditionLabel[] = [
  "Single, No Role",
  "Single, Role",
  "Debate, No Role",
  "Debate, Role",
];

const ANSWER_VALUES: AnswerValue[] = ["Yes", "No", "Maybe"];

const STORY_STEPS = [
  { title: "Set the Question", shortTitle: "Question", kicker: "What is being asked" },
  { title: "Your First Answer", shortTitle: "First Answer", kicker: "Before seeing results" },
  { title: "Case 1", shortTitle: "Case 1", kicker: "Start simple" },
  { title: "Case 2", shortTitle: "Case 2", kicker: "Add a cost" },
  { title: "Case 3", shortTitle: "Case 3", kicker: "Add a public setting" },
  { title: "Case 4", shortTitle: "Case 4", kicker: "Add expectations" },
  { title: "Results", shortTitle: "Results", kicker: "Compare the model runs" },
  { title: "Agent Discussion", shortTitle: "Discussion", kicker: "Why the result moved" },
  { title: "Final Answer", shortTitle: "Final", kicker: "Where you land now" },
];

const QUESTION_SCOPES = [
  {
    title: "Start Simple",
    detail: "A plain version of the issue.",
  },
  {
    title: "Add a Cost",
    detail: "The same issue, but with a practical downside.",
  },
  {
    title: "Add a Public Setting",
    detail: "The decision now affects more than one person.",
  },
  {
    title: "Add Expectations",
    detail: "Work, school, or social rules change the stakes.",
  },
  {
    title: "Hard Case",
    detail: "A final check against the answer you started with.",
  },
];

function StoryHeader({
  step,
  title,
  kicker,
}: {
  step: number;
  title: string;
  kicker: string;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="accent">Part {step}</Badge>
        <span className="text-sm text-[var(--muted-foreground)]">{kicker}</span>
      </div>
      <h2 className="text-2xl">{title}</h2>
    </div>
  );
}

function MissingQuestionCard() {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted-foreground)]">
      This prompt is unavailable in the current topic data.
    </div>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatRounds(rounds: number) {
  return `${rounds} ${rounds === 1 ? "round" : "rounds"}`;
}

function getTopicSides(title: string) {
  const [yesSide, counterSide] = title.split(" vs ");
  return {
    yesSide: yesSide?.trim() || title,
    counterSide: counterSide?.trim() || "the competing value",
  };
}

function getNarrativeQuestion(title: string) {
  const { yesSide, counterSide } = getTopicSides(title);
  return `When ${yesSide.toLowerCase()} conflicts with ${counterSide.toLowerCase()}, what should win?`;
}

function getOutcomeCounts(question: QuestionItem) {
  const counts: Record<AnswerValue, number> = { Yes: 0, No: 0, Maybe: 0 };

  Object.values(question.conditionSummary).forEach((summary) => {
    counts[summary.outcome] += 1;
  });

  return counts;
}

function getOutcomeSummary(question: QuestionItem) {
  const counts = getOutcomeCounts(question);
  const ranked = ANSWER_VALUES.map((answer) => ({
    answer,
    count: counts[answer],
  })).sort((a, b) => b.count - a.count);
  const leader = ranked[0];

  if (leader.count === 4) {
    return `Every setup landed on ${leader.answer}.`;
  }

  const split = ranked
    .filter((item) => item.count > 0)
    .map((item) => `${item.answer} ${item.count}`)
    .join(", ");

  return `${leader.answer} was the most common result: ${split}.`;
}

function getTurnText(turn: ConversationItem["turns"][number]) {
  if (turn.speaker === "Moderator") {
    return turn.text.replace("Opening prompt: ", "");
  }

  if (turn.text.includes("challenge the default intuition")) {
    return "Asks for stronger proof before agreeing.";
  }

  if (turn.text.includes("constructive framing")) {
    return "Looks for a practical middle path.";
  }

  if (turn.text.includes("utility view")) {
    return "Focuses on the wider group impact.";
  }

  if (turn.text.includes("rule consistency")) {
    return "Prefers clear rules unless there is a strong reason to bend them.";
  }

  return turn.text;
}

function getFeaturedConversation(conversations: ConversationItem[]) {
  return [...conversations].sort((a, b) => {
    const aWeight = a.roundsCompleted * 10 + (a.finalConsensus === "Maybe" ? 2 : 0);
    const bWeight = b.roundsCompleted * 10 + (b.finalConsensus === "Maybe" ? 2 : 0);
    return bWeight - aWeight;
  })[0];
}

function getMetricHighlights(metric: TopicMetric | undefined) {
  if (!metric) return null;

  const entries = CONDITION_ORDER.map((label) => ({
    label,
    value: metric.yesRateByCondition[label],
  })).sort((a, b) => b.value - a.value);

  return {
    strongest: entries[0],
    weakest: entries[entries.length - 1],
    spread: entries[0].value - entries[entries.length - 1].value,
  };
}

function EvidenceStrip({ question }: { question: QuestionItem }) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {Object.entries(question.conditionSummary).map(([key, summary]) => (
        <div
          key={key}
          className="rounded-md border border-[var(--line-subtle)] bg-[var(--card-muted)] px-3 py-2 text-sm"
        >
          <div className="text-xs text-[var(--muted-foreground)]">
            {CONDITION_LABELS[key as keyof typeof CONDITION_LABELS]}
          </div>
          <div className="mt-1 font-semibold">{summary.outcome}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {summary.yesVotes} yes, {summary.noVotes} no
          </div>
        </div>
      ))}
    </div>
  );
}

function PromptEvidenceCard({
  question,
  scope,
  children,
}: {
  question: QuestionItem | undefined;
  scope: (typeof QUESTION_SCOPES)[number];
  children?: ReactNode;
}) {
  if (!question) return <MissingQuestionCard />;

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <BookOpenText className="h-4 w-4" />
          {scope.title}
        </div>
        <h3 className="font-serif text-xl font-semibold">{question.prompt}</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{scope.detail}</p>
      </div>
      <EvidenceStrip question={question} />
      <p className="text-sm text-[var(--muted-foreground)]">{getOutcomeSummary(question)}</p>
      {children}
    </div>
  );
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [deckState, setDeckState] = useState({ slug, activeStep: 0 });
  const activeStep = deckState.slug === slug ? deckState.activeStep : 0;
  const { data: manifest, isLoading: isManifestLoading, error: manifestError } = useManifest();
  const { data: questions, isLoading: isQuestionsLoading, error: questionsError } =
    useTopicQuestions(slug);
  const { data: conversations, isLoading: isConversationsLoading, error: conversationsError } =
    useTopicConversations(slug);
  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useOverviewMetrics();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

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

  const topicMetric = metrics.find((metric) => metric.topicSlug === slug);
  const topicMetrics = topicMetric ? [topicMetric] : [];
  const metricHighlights = getMetricHighlights(topicMetric);
  const storyQuestions = questions.slice(0, 5);
  const anchorQuestion = storyQuestions[0];
  const costQuestion = storyQuestions[1];
  const systemQuestion = storyQuestions[2];
  const roleQuestion = storyQuestions[3];
  const edgeQuestion = storyQuestions[4];
  const featuredConversation = getFeaturedConversation(conversations);
  const featuredPrompt = featuredConversation
    ? questions.find((question) => question.id === featuredConversation.questionId)?.prompt
    : null;
  const narrativeQuestion = getNarrativeQuestion(topic.title);
  const { yesSide, counterSide } = getTopicSides(topic.title);
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === STORY_STEPS.length - 1;
  const setActiveStep = (nextStep: number | ((currentStep: number) => number)) => {
    setDeckState((current) => {
      const currentStep = current.slug === slug ? current.activeStep : 0;
      const nextActiveStep =
        typeof nextStep === "function" ? nextStep(currentStep) : nextStep;

      return { slug, activeStep: nextActiveStep };
    });
  };

  const activeContent = (() => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <div className="grid gap-4">
              <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <Scale className="h-4 w-4" />
                  Main question
                </div>
                <p className="text-2xl leading-snug">{narrativeQuestion}</p>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">{topic.definition}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="text-xs text-[var(--muted-foreground)]">A Yes answer favors</div>
                  <div className="mt-1 font-serif text-xl font-semibold">{yesSide}</div>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{topic.yesMeans}</p>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="text-xs text-[var(--muted-foreground)]">A No answer favors</div>
                  <div className="mt-1 font-serif text-xl font-semibold">{counterSide}</div>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    The cases check when this side starts to look stronger.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[var(--card-muted)] p-5">
              <div className="mb-3 text-sm font-semibold text-[var(--muted-foreground)]">
                Cases coming up
              </div>
              <div className="grid gap-2">
                {STORY_STEPS.slice(2, 6).map((step, index) => (
                  <div
                    key={step.shortTitle}
                    className="flex items-center gap-3 rounded-md bg-[var(--surface)] px-3 py-2 text-sm"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--line)] font-semibold">
                      {index + 1}
                    </span>
                    {step.kicker}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <TopicFeedbackCheckpoint
            topicSlug={topic.slug}
            stage="First Lean"
            prompt={narrativeQuestion}
          />
        );
      case 2:
        return (
          <PromptEvidenceCard question={anchorQuestion} scope={QUESTION_SCOPES[0]}>
            {anchorQuestion ? (
              <TopicFeedbackCheckpoint
                topicSlug={topic.slug}
                stage="After Case 1"
                prompt="After this case, where do you lean?"
                questionId={anchorQuestion.id}
                showEvidenceSlider
              />
            ) : null}
          </PromptEvidenceCard>
        );
      case 3:
        return <PromptEvidenceCard question={costQuestion} scope={QUESTION_SCOPES[1]} />;
      case 4:
        return <PromptEvidenceCard question={systemQuestion} scope={QUESTION_SCOPES[2]} />;
      case 5:
        return (
          <PromptEvidenceCard question={roleQuestion} scope={QUESTION_SCOPES[3]}>
            <TopicFeedbackCheckpoint
              topicSlug={topic.slug}
              stage="After Case 4"
              prompt="After four cases, where do you lean now?"
              showEvidenceSlider
            />
          </PromptEvidenceCard>
        );
      case 6:
        return (
          <div className="grid gap-4">
            {topicMetric && metricHighlights ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <TrendingUp className="h-4 w-4" />
                    Highest Yes rate
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatPercent(metricHighlights.strongest.value)}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {metricHighlights.strongest.label}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <BarChart3 className="h-4 w-4" />
                    Range
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatPercent(metricHighlights.spread)}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Difference between the highest and lowest Yes rates.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <UsersRound className="h-4 w-4" />
                    Mind changes
                  </div>
                  <div className="text-2xl font-semibold">{topicMetric.anyMindChangedRate}%</div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Prompts where at least one agent changed answer.
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid gap-4 xl:grid-cols-2">
              <ConditionBarChart metrics={topicMetrics} title="Yes Rate by Setup" />
              <RoundsCompareChart metrics={topicMetrics} title="Debate Rounds" />
            </div>
            <TopicFeedbackCheckpoint
              topicSlug={topic.slug}
              stage="After Results"
              prompt="After the results, which answer feels best supported?"
              showEvidenceSlider
            />
          </div>
        );
      case 7:
        return featuredConversation ? (
          <div className="grid gap-4">
            <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <MessageSquareText className="h-4 w-4" />
                Debate prompt
              </div>
              <h3 className="font-serif text-xl font-semibold">{featuredPrompt}</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Final answer: <strong>{featuredConversation.finalConsensus}</strong>. Length:{" "}
                <strong>{formatRounds(featuredConversation.roundsCompleted)}</strong>.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {featuredConversation.roleAssignments.map((assignment) => (
                <Badge key={assignment.agent} variant="subtle">
                  {assignment.agent}: {assignment.role}
                </Badge>
              ))}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {featuredConversation.turns.map((turn, index) => (
                <div
                  key={`${turn.speaker}-${index}`}
                  className="rounded-md border border-[var(--line-subtle)] bg-[var(--surface)] p-3"
                >
                  <div className="mb-1 text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                    {index + 1}. {turn.speaker}
                  </div>
                  <p className="text-sm">{getTurnText(turn)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[var(--muted-foreground)]">No sample conversation found.</p>
        );
      default:
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="grid gap-3">
              <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <CheckCircle2 className="h-4 w-4" />
                  What you saw
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  You answered first, checked four cases, compared the model runs, and reviewed a
                  short agent discussion.
                </p>
              </div>
              {edgeQuestion ? (
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <Badge variant="subtle">{QUESTION_SCOPES[4].title}</Badge>
                  <h3 className="mt-2 font-serif text-lg font-semibold">{edgeQuestion.prompt}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {getOutcomeSummary(edgeQuestion)} Use this as a final check against your answer.
                  </p>
                </div>
              ) : null}
            </div>
            <TopicFeedbackCheckpoint
              topicSlug={topic.slug}
              stage="Final Answer"
              prompt="Where do you land now?"
              questionId={edgeQuestion?.id}
              showEvidenceSlider
            />
          </div>
        );
    }
  })();

  return (
    <div className="grid gap-5">
      <section className="senate-panel colonnade p-6 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{topic.spectrum}</Badge>
              <Badge variant="subtle">{topic.questionCount} prompts</Badge>
            </div>
            <h1 className="mt-3 text-3xl">{topic.title}</h1>
            <p className="mt-2 text-xl leading-snug">{narrativeQuestion}</p>
            <p className="mt-2 text-[var(--muted-foreground)]">{topic.definition}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/topics">
              <ArrowLeft className="h-4 w-4" />
              Topics
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-3 xl:grid-cols-9">
        {STORY_STEPS.map((step, index) => (
          <button
            key={step.shortTitle}
            type="button"
            onClick={() => setActiveStep(index)}
            aria-current={activeStep === index ? "step" : undefined}
            className={`rounded-md border px-3 py-3 text-left transition-colors ${
              activeStep === index
                ? "border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--card-muted)]"
            }`}
          >
            <div
              className={`text-xs ${
                activeStep === index
                  ? "text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {index + 1}
            </div>
            <div className="font-serif text-base font-semibold">{step.shortTitle}</div>
          </button>
        ))}
      </section>

      <section className="senate-panel p-5 md:p-6">
        <StoryHeader
          step={activeStep + 1}
          title={STORY_STEPS[activeStep].title}
          kicker={STORY_STEPS[activeStep].kicker}
        />
        <div className="min-h-[440px]">{activeContent}</div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-subtle)] pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isFirstStep}
            onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-[var(--muted-foreground)]">
            {activeStep + 1} of {STORY_STEPS.length}
          </div>
          <Button
            type="button"
            disabled={isLastStep}
            onClick={() =>
              setActiveStep((current) => Math.min(STORY_STEPS.length - 1, current + 1))
            }
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
