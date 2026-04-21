"use client";

import { useState } from "react";
import { MessageSquareText, Download, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useFeedback } from "@/components/providers/feedback-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackDock() {
  const pathname = usePathname();
  const { submit, entries, clear, exportJson } = useFeedback();
  const [open, setOpen] = useState(false);
  const [topicSlug, setTopicSlug] = useState("");
  const [perceptionGap, setPerceptionGap] = useState(3);
  const [clarity, setClarity] = useState(3);
  const [chartUsefulness, setChartUsefulness] = useState(3);
  const [comment, setComment] = useState("");

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-50 flex h-12 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-lg"
        onClick={() => setOpen((current) => !current)}
      >
        <MessageSquareText className="h-4 w-4" />
        Feedback
      </button>

      {open ? (
        <Card className="fixed bottom-20 right-5 z-50 w-[min(92vw,380px)] border-[var(--line)] bg-[var(--surface)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Feedback (Local Only)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Label className="grid gap-1.5">
              Topic (optional)
              <Input
                value={topicSlug}
                placeholder="ex: data-privacy"
                onChange={(event) => setTopicSlug(event.target.value)}
              />
            </Label>
            <Label className="grid gap-1.5">
              Perception Gap (1-5)
              <Input
                type="number"
                min={1}
                max={5}
                value={perceptionGap}
                onChange={(event) => setPerceptionGap(Number(event.target.value || 3))}
              />
            </Label>
            <Label className="grid gap-1.5">
              Clarity (1-5)
              <Input
                type="number"
                min={1}
                max={5}
                value={clarity}
                onChange={(event) => setClarity(Number(event.target.value || 3))}
              />
            </Label>
            <Label className="grid gap-1.5">
              Chart usefulness (1-5)
              <Input
                type="number"
                min={1}
                max={5}
                value={chartUsefulness}
                onChange={(event) => setChartUsefulness(Number(event.target.value || 3))}
              />
            </Label>
            <Label className="grid gap-1.5">
              Comment
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What felt clear or confusing?"
              />
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => {
                  submit({
                    pagePath: pathname,
                    topicSlug: topicSlug.trim() || null,
                    perceptionGap,
                    clarity,
                    chartUsefulness,
                    comment: comment.trim(),
                  });
                  setComment("");
                }}
              >
                Submit
              </Button>
              <Button variant="secondary" onClick={exportJson}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="ghost" onClick={clear}>
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              <span className="text-xs text-[var(--muted-foreground)]">
                Collected: {entries.length}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
