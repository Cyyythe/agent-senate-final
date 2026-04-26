"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { EyeOff, UserRoundSearch } from "lucide-react";
import { useFeedback } from "@/components/providers/feedback-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type BlindMatchCard } from "@/lib/types";
import { cn } from "@/lib/utils";

function confidenceLabel(confidence: number | null) {
  if (confidence === null) return null;
  return `${confidence}/10 confidence`;
}

export function BlindAnswerMatch({
  topicSlug,
  stage,
  questionId,
  cards,
}: {
  topicSlug: string;
  stage: string;
  questionId: string;
  cards: BlindMatchCard[];
}) {
  const pathname = usePathname();
  const { submit } = useFeedback();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const [showAttribution, setShowAttribution] = useState(false);

  const selectedCard = cards.find((card) => card.slot === selectedSlot) ?? null;

  return (
    <div className="grid gap-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_1px_0_rgba(255,255,255,.65)_inset]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-[var(--accent-strong)]" />
            <h3 className="font-serif text-lg font-semibold">Blind Answer Match</h3>
          </div>
          <p className="max-w-3xl text-sm text-[var(--muted-foreground)]">
            The case is hidden for now. Read the four answers first, then pick the one you agree
            with most.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="subtle">{stage}</Badge>
          {saved ? <Badge variant="accent">Saved</Badge> : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => {
          const selected = selectedSlot === card.slot;
          return (
            <button
              key={card.slot}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setSelectedSlot(card.slot);
                setSaved(false);
              }}
              className={cn(
                "answer-tablet grid min-h-[172px] gap-3 rounded-md border border-[var(--line)] bg-[var(--card)] p-4 pt-5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--bronze)] hover:bg-[var(--surface)]",
                selected &&
                  "border-[var(--accent-strong)] bg-[var(--accent-muted)] shadow-[0_0_0_2px_rgba(118,36,31,.12)]"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] font-semibold">
                    {card.slot}
                  </span>
                  <Badge variant={card.decision === "Yes" ? "accent" : "default"}>
                    {card.decision}
                  </Badge>
                </div>
                {card.confidence !== null ? (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {confidenceLabel(card.confidence)}
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-[var(--foreground)]">
                {card.reasoningPreview ?? "No written explanation was captured in this run."}
              </p>
              {showAttribution ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line-subtle)] pt-2 text-xs text-[var(--muted-foreground)]">
                  <UserRoundSearch className="h-3.5 w-3.5" />
                  <span>{card.agent}</span>
                  {card.role ? <span>{card.role}</span> : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <Label className="grid gap-2">
          Optional note
          <Textarea
            value={comment}
            onChange={(event) => {
              setComment(event.target.value);
              setSaved(false);
            }}
            placeholder="Why did this answer feel closest to your view?"
          />
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setShowAttribution((value) => !value)}>
            {showAttribution ? "Hide names" : "Show names"}
          </Button>
          <Button
            type="button"
            disabled={!selectedCard}
            onClick={() => {
              submit({
                pagePath: pathname,
                topicSlug,
                stage,
                questionId,
                alignedSlot: selectedCard?.slot ?? null,
                alignedAgent: selectedCard?.agent ?? null,
                alignedDecision: selectedCard?.decision ?? null,
                comment: comment.trim(),
              });
              setSaved(true);
            }}
          >
            Save Pick
          </Button>
        </div>
      </div>
    </div>
  );
}
