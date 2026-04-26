"use client";

import Link from "next/link";
import { use, useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  Eye,
  MessageSquareText,
  Scale,
  Shuffle,
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
  type AgentName,
  type ConditionKey,
  type ConversationItem,
  type QuestionItem,
  type TopicMetric,
} from "@/lib/types";
import { BlindAnswerMatch } from "@/components/blind-answer-match";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StateBox } from "@/components/state-box";
import { ConditionBarChart } from "@/components/charts/condition-bar-chart";
import { RoundsCompareChart } from "@/components/charts/rounds-compare-chart";
import { TopicFeedbackCheckpoint } from "@/components/topic-feedback-checkpoint";

type ConditionLabel = keyof TopicMetric["yesRateByCondition"];

const AGENT_ORDER: AgentName[] = ["ChatGPT", "Claude", "Gemini", "Grok"];
const CONDITION_ORDER: ConditionKey[] = [
  "single_no_role",
  "single_role",
  "debate_no_role",
  "debate_role",
];
const CHART_CONDITION_ORDER: ConditionLabel[] = [
  "Single, No Role",
  "Single, Role",
  "Debate, No Role",
  "Debate, Role",
];
const STORY_STEPS = [
  { title: "Set the Question", shortTitle: "Intro", kicker: "What this topic is asking" },
  { title: "Sample 1", shortTitle: "Sample 1", kicker: "Start with a cleaner case" },
  { title: "Sample 2", shortTitle: "Sample 2", kicker: "See where setup changes the answer" },
  { title: "Sample 3", shortTitle: "Sample 3", kicker: "Check a harder split" },
  { title: "One Debate", shortTitle: "Debate", kicker: "Watch one real disagreement play out" },
  { title: "Whole Topic", shortTitle: "Data", kicker: "Step back to the larger pattern" },
  { title: "Final Answer", shortTitle: "Final", kicker: "Where you land after the evidence" },
] as const;

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
      This sample is unavailable in the current topic data.
    </div>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatPercentFromRate(value: number) {
  return `${Math.round(value)}%`;
}

function formatRounds(rounds: number) {
  return `${rounds} ${rounds === 1 ? "round" : "rounds"}`;
}

function formatConditionOutcome(question: QuestionItem, condition: ConditionKey) {
  const summary = question.conditionSummary[condition];
  if (summary.rawOutcome === "Stalemate") {
    return "Split 2-2";
  }
  return summary.outcome;
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

function getQuestionPatternSummary(question: QuestionItem) {
  const outcomes = CONDITION_ORDER.map((condition) => question.conditionSummary[condition].outcome);
  const rawOutcomes = CONDITION_ORDER.map((condition) => question.conditionSummary[condition].rawOutcome);
  const uniqueOutcomes = new Set(outcomes);

  if (rawOutcomes.every((outcome) => outcome === rawOutcomes[0]) && rawOutcomes[0] !== "Stalemate") {
    return `Every setup landed on ${rawOutcomes[0]}.`;
  }

  if (rawOutcomes.includes("Stalemate")) {
    return "At least one setup split 2-2 instead of settling on a clear answer.";
  }

  if (uniqueOutcomes.size > 1) {
    return "The answer changed across the four setups.";
  }

  return "The setups leaned the same way overall, but not with the same vote pattern.";
}

function countAnswerShifts(question: QuestionItem) {
  const uniqueOutcomes = new Set(
    CONDITION_ORDER.map((condition) => question.conditionSummary[condition].outcome)
  );
  return uniqueOutcomes.size;
}

function getReasoningCount(question: QuestionItem) {
  return (question.blindMatch?.cards ?? []).filter((card) => card.reasoningPreview).length;
}

function pickStoryQuestions(questions: QuestionItem[]) {
  if (questions.length === 0) return [];

  const used = new Set<string>();
  const picked: QuestionItem[] = [];

  const stableCase =
    questions.find(
      (question) =>
        countAnswerShifts(question) === 1 &&
        !CONDITION_ORDER.some(
          (condition) => question.conditionSummary[condition].rawOutcome === "Stalemate"
        ) &&
        getReasoningCount(question) >= 3
    ) ?? questions[0];

  picked.push(stableCase);
  used.add(stableCase.id);

  const swingCase =
    questions.find(
      (question) =>
        !used.has(question.id) &&
        question.conditionSummary.single_no_role.outcome !==
          question.conditionSummary.debate_role.outcome &&
        getReasoningCount(question) >= 3
    ) ??
    questions.find(
      (question) => !used.has(question.id) && countAnswerShifts(question) > 1
    ) ??
    questions.find((question) => !used.has(question.id));

  if (swingCase) {
    picked.push(swingCase);
    used.add(swingCase.id);
  }

  const splitCase =
    questions.find(
      (question) =>
        !used.has(question.id) &&
        CONDITION_ORDER.some(
          (condition) => question.conditionSummary[condition].rawOutcome === "Stalemate"
        ) &&
        getReasoningCount(question) >= 3
    ) ?? questions.find((question) => !used.has(question.id));

  if (splitCase) {
    picked.push(splitCase);
    used.add(splitCase.id);
  }

  while (picked.length < 3) {
    const fallback = questions.find((question) => !used.has(question.id));
    if (!fallback) break;
    picked.push(fallback);
    used.add(fallback.id);
  }

  return picked;
}

function countConversationSwitches(conversation: ConversationItem) {
  return AGENT_ORDER.filter(
    (agent) => conversation.initialResponses[agent].decision !== conversation.finalState[agent].decision
  ).length;
}

function getFeaturedConversation(
  conversations: ConversationItem[],
  preferredQuestionIds: string[]
) {
  return [...conversations].sort((left, right) => {
    const leftPriority = preferredQuestionIds.includes(left.questionId) ? 100 : 0;
    const rightPriority = preferredQuestionIds.includes(right.questionId) ? 100 : 0;
    const leftScore = leftPriority + left.roundsCompleted * 10 + countConversationSwitches(left) * 3;
    const rightScore =
      rightPriority + right.roundsCompleted * 10 + countConversationSwitches(right) * 3;
    return rightScore - leftScore;
  })[0];
}

function getMetricHighlights(metric: TopicMetric | undefined) {
  if (!metric) return null;

  const entries = CHART_CONDITION_ORDER.map((label) => ({
    label,
    value: metric.yesRateByCondition[label],
  })).sort((left, right) => right.value - left.value);

  return {
    strongest: entries[0],
    weakest: entries[entries.length - 1],
    spread: entries[0].value - entries[entries.length - 1].value,
  };
}

function EvidenceStrip({ question }: { question: QuestionItem }) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {CONDITION_ORDER.map((condition) => {
        const summary = question.conditionSummary[condition];
        return (
          <div
            key={condition}
            className="rounded-md border border-[var(--line-subtle)] bg-[var(--card-muted)] px-3 py-2 text-sm"
          >
            <div className="text-xs text-[var(--muted-foreground)]">{CONDITION_LABELS[condition]}</div>
            <div className="mt-1 font-semibold">{formatConditionOutcome(question, condition)}</div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {summary.yesVotes} yes, {summary.noVotes} no
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SampleStep({
  topicSlug,
  label,
  question,
}: {
  topicSlug: string;
  label: string;
  question: QuestionItem | undefined;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!question) return <MissingQuestionCard />;

  const blindMatch = question.blindMatch;
  const blindCards = blindMatch?.cards ?? [];

  return (
    <div className="grid gap-4">
      <BlindAnswerMatch
        key={question.id}
        topicSlug={topicSlug}
        stage={`${label} blind pick`}
        questionId={question.id}
        cards={blindCards}
      />

      <div className="rounded-md border border-[var(--line)] bg-[var(--card-muted)] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Shuffle className="h-4 w-4" />
              Source run
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              These blind answers came from{" "}
              <strong>{CONDITION_LABELS[blindMatch.sourceCondition]}</strong>.
            </p>
          </div>
          <Button type="button" onClick={() => setRevealed((value) => !value)}>
            <Eye className="h-4 w-4" />
            {revealed ? "Hide Case" : "Reveal Case"}
          </Button>
        </div>
      </div>

      {revealed ? (
        <>
          <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <BookOpenText className="h-4 w-4" />
              Revealed case
            </div>
            <h3 className="font-serif text-xl font-semibold">{question.prompt}</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {getQuestionPatternSummary(question)}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {blindCards.map((card) => (
              <div
                key={card.slot}
                className="rounded-md border border-[var(--line-subtle)] bg-[var(--surface)] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="subtle">Answer {card.slot}</Badge>
                  <Badge variant={card.decision === "Yes" ? "accent" : "default"}>
                    {card.decision}
                  </Badge>
                </div>
                <div className="font-semibold">{card.agent}</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {card.role ?? "No role assignment"}
                </div>
              </div>
            ))}
          </div>

          <EvidenceStrip question={question} />

          <TopicFeedbackCheckpoint
            topicSlug={topicSlug}
            stage={`${label} revealed`}
            prompt="Now that you can see the case, what is your answer?"
            questionId={question.id}
            showEvidenceSlider
          />
        </>
      ) : (
        <div className="rounded-md border border-dashed border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted-foreground)]">
          Reveal the case when you are ready to compare your pick against the actual prompt and the
          four run setups.
        </div>
      )}
    </div>
  );
}

function DebateStep({ conversation }: { conversation: ConversationItem | undefined }) {
  if (!conversation) {
    return (
      <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted-foreground)]">
        No debate snapshot was available for this topic.
      </div>
    );
  }

  const switchCount = countConversationSwitches(conversation);
  const leadRedirect =
    conversation.rounds
      .flatMap((round) => AGENT_ORDER.map((agent) => round.agents[agent].moderatorRedirect))
      .find(Boolean) ?? null;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <MessageSquareText className="h-4 w-4" />
            Debate prompt
          </div>
          <h3 className="font-serif text-xl font-semibold">{conversation.prompt}</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Final answer: <strong>{conversation.finalConsensus}</strong>. Length:{" "}
            <strong>{formatRounds(conversation.roundsCompleted)}</strong>. Agents who switched:{" "}
            <strong>{switchCount}</strong>.
          </p>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[var(--card-muted)] p-4">
          <div className="mb-3 text-sm font-semibold text-[var(--muted-foreground)]">
            Vote history
          </div>
          <div className="grid gap-2">
            {(conversation.voteHistory.length > 0 ? conversation.voteHistory : [{ round: 0, yes: 0, no: 0 }]).map(
              (point) => (
                <div
                  key={point.round}
                  className="flex items-center justify-between rounded-md bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <span>Round {point.round}</span>
                  <span>
                    {point.yes} yes / {point.no} no
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {leadRedirect ? (
        <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="mb-2 text-sm font-semibold text-[var(--muted-foreground)]">
            Moderator pressure
          </div>
          <p className="text-sm">{leadRedirect}</p>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {AGENT_ORDER.map((agent) => {
          const initial = conversation.initialResponses[agent];
          const final = conversation.finalState[agent];
          const switched = initial.decision !== final.decision;

          return (
            <div
              key={agent}
              className="rounded-md border border-[var(--line-subtle)] bg-[var(--surface)] p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{agent}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {initial.role ?? "No role assignment"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={initial.decision === "Yes" ? "accent" : "default"}>
                    Started {initial.decision}
                  </Badge>
                  <Badge variant={final.decision === "Yes" ? "accent" : "default"}>
                    Ended {final.decision}
                  </Badge>
                </div>
              </div>
              <p className="text-sm leading-6">
                {initial.reasoningPreview ?? "No written opening argument was captured."}
              </p>
              <div className="mt-3 text-xs text-[var(--muted-foreground)]">
                {switched ? "Changed position during the debate." : "Held the same position."}
              </div>
            </div>
          );
        })}
      </div>
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
        message="Reading prompt samples, debate records, and topic metrics."
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
    return <StateBox title="Topic not found" message={`No topic metadata found for "${slug}".`} />;
  }

  const topicMetric = metrics.find((metric) => metric.topicSlug === slug);
  const topicMetrics = topicMetric ? [topicMetric] : [];
  const metricHighlights = getMetricHighlights(topicMetric);
  const storyQuestions = pickStoryQuestions(questions);
  const [sampleOne, sampleTwo, sampleThree] = storyQuestions;
  const featuredConversation = getFeaturedConversation(
    conversations,
    storyQuestions.map((question) => question.id)
  );
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

  const activeContent: ReactNode = (() => {
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
                    The samples test when this side starts to look stronger.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[var(--card-muted)] p-5">
              <div className="mb-3 text-sm font-semibold text-[var(--muted-foreground)]">
                What happens next
              </div>
              <div className="grid gap-2">
                {[
                  "Read blind answers before you see the case.",
                  "Reveal the case and compare the four run setups.",
                  "Inspect one full debate, then step back to the topic-wide data.",
                ].map((line, index) => (
                  <div
                    key={line}
                    className="flex items-center gap-3 rounded-md bg-[var(--surface)] px-3 py-2 text-sm"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--line)] font-semibold">
                      {index + 1}
                    </span>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <SampleStep
            key={sampleOne?.id ?? "sample-1"}
            topicSlug={topic.slug}
            label="Sample 1"
            question={sampleOne}
          />
        );
      case 2:
        return (
          <SampleStep
            key={sampleTwo?.id ?? "sample-2"}
            topicSlug={topic.slug}
            label="Sample 2"
            question={sampleTwo}
          />
        );
      case 3:
        return (
          <SampleStep
            key={sampleThree?.id ?? "sample-3"}
            topicSlug={topic.slug}
            label="Sample 3"
            question={sampleThree}
          />
        );
      case 4:
        return <DebateStep conversation={featuredConversation} />;
      case 5:
        return (
          <div className="grid gap-4">
            {topicMetric && metricHighlights ? (
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <BarChart3 className="h-4 w-4" />
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
                    <Shuffle className="h-4 w-4" />
                    Setup changed answer
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatPercentFromRate(topicMetric.conditionDisagreementRate)}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Prompts where the four setups did not land the same way.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <UsersRound className="h-4 w-4" />
                    Debate switchers
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatPercentFromRate(topicMetric.anyMindChangedRate)}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Prompts where at least one agent changed answer during a debate.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <MessageSquareText className="h-4 w-4" />
                    Split rate
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatPercentFromRate(topicMetric.stalemateRate)}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Prompts where at least one setup ended in a 2-2 split.
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid gap-4 xl:grid-cols-2">
              <ConditionBarChart metrics={topicMetrics} title="Yes Rate by Setup" />
              <RoundsCompareChart metrics={topicMetrics} title="Average Debate Length" />
            </div>
            <TopicFeedbackCheckpoint
              topicSlug={topic.slug}
              stage="Whole topic"
              prompt="After the topic-wide data, which answer feels best supported?"
              showEvidenceSlider
            />
          </div>
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
                  You matched yourself to blind answers, revealed three cases, inspected one real
                  debate, and then checked the full topic pattern.
                </p>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="text-xs text-[var(--muted-foreground)]">Question count</div>
                <div className="mt-1 font-serif text-xl font-semibold">{topic.questionCount} prompts</div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  This final answer should reflect both the sample cases and the broader run data.
                </p>
              </div>
            </div>
            <TopicFeedbackCheckpoint
              topicSlug={topic.slug}
              stage="Final answer"
              prompt="After this topic, where do you land?"
              showEvidenceSlider
            />
          </div>
        );
    }
  })();

  return (
    <div className="grid gap-5">
      <section className="forum-hero">
        <div className="forum-hero-content">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{topic.spectrum}</Badge>
              <Badge variant="subtle">{topic.questionCount} prompts</Badge>
            </div>
            <h1 className="forum-title mt-4">{topic.title}</h1>
            <p className="forum-subtitle mt-4">{narrativeQuestion}</p>
            <p className="mt-2 text-[var(--muted-foreground)]">{topic.definition}</p>
          </div>
          <Button asChild variant="outline" className="forum-action">
            <Link href="/topics">
              <ArrowLeft className="h-4 w-4" />
              Topics
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-3 xl:grid-cols-7">
        {STORY_STEPS.map((step, index) => (
          <button
            key={step.shortTitle}
            type="button"
            onClick={() => setActiveStep(index)}
            aria-current={activeStep === index ? "step" : undefined}
            className={`chamber-step rounded-md border px-3 py-3 pl-4 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bronze)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
              activeStep === index
                ? "border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--bronze)] hover:bg-[var(--card-muted)]"
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
