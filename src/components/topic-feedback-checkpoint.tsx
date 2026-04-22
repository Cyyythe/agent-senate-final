"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { useFeedback } from "@/components/providers/feedback-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type AnswerValue } from "@/lib/types";
import { cn } from "@/lib/utils";

const ANSWERS: AnswerValue[] = ["Yes", "No", "Maybe"];

export function TopicFeedbackCheckpoint({
  topicSlug,
  stage,
  prompt,
  questionId,
  showEvidenceSlider = false,
}: {
  topicSlug: string;
  stage: string;
  prompt: string;
  questionId?: string;
  showEvidenceSlider?: boolean;
}) {
  const pathname = usePathname();
  const { submit } = useFeedback();
  const [answer, setAnswer] = useState<AnswerValue | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [evidenceUsefulness, setEvidenceUsefulness] = useState(3);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-[var(--accent-strong)]" />
          <h3 className="font-serif text-lg font-semibold">Quick Check</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="subtle">{stage}</Badge>
          {saved ? <Badge variant="accent">Saved</Badge> : null}
        </div>
      </div>

      <p className="mb-3 text-base">{prompt}</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-3">
          <Label>Your answer</Label>
          <div className="grid grid-cols-3 gap-2">
            {ANSWERS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={answer === value}
                onClick={() => {
                  setAnswer(value);
                  setSaved(false);
                }}
                className={cn(
                  "h-10 rounded-md border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold transition-colors",
                  answer === value &&
                    "border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                )}
              >
                {value}
              </button>
            ))}
          </div>

          <Label className="grid gap-2">
            Confidence: {confidence}
            <input
              type="range"
              min={1}
              max={5}
              value={confidence}
              onChange={(event) => {
                setConfidence(Number(event.target.value));
                setSaved(false);
              }}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>Low</span>
              <span>High</span>
            </div>
          </Label>

          {showEvidenceSlider ? (
            <Label className="grid gap-2">
              Evidence helped: {evidenceUsefulness}
              <input
                type="range"
                min={1}
                max={5}
                value={evidenceUsefulness}
                onChange={(event) => {
                  setEvidenceUsefulness(Number(event.target.value));
                  setSaved(false);
                }}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>Not much</span>
                <span>A lot</span>
              </div>
            </Label>
          ) : null}
        </div>

        <div className="grid gap-3">
          <Label className="grid gap-2">
            Optional note
            <Textarea
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setSaved(false);
              }}
              placeholder="What made you shift, if anything?"
            />
          </Label>
          <Button
            type="button"
            onClick={() => {
              submit({
                pagePath: pathname,
                topicSlug,
                stage,
                questionId: questionId ?? null,
                userAnswer: answer,
                confidence,
                evidenceUsefulness: showEvidenceSlider ? evidenceUsefulness : undefined,
                perceptionGap: confidence,
                clarity: confidence,
                chartUsefulness: showEvidenceSlider ? evidenceUsefulness : 3,
                comment: comment.trim(),
              });
              setSaved(true);
            }}
          >
            Save Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
