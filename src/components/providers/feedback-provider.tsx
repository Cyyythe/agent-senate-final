"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type AgentName, type AnswerValue, type FeedbackEntry } from "@/lib/types";

const STORAGE_KEY = "senate-insight-feedback-v1";

interface NewFeedbackInput {
  pagePath: string;
  topicSlug: string | null;
  stage?: string | null;
  questionId?: string | null;
  userAnswer?: AnswerValue | null;
  alignedSlot?: string | null;
  alignedAgent?: AgentName | null;
  alignedDecision?: AnswerValue | null;
  confidence?: number;
  evidenceUsefulness?: number;
  perceptionGap?: number;
  clarity?: number;
  chartUsefulness?: number;
  comment: string;
}

interface FeedbackContextValue {
  entries: FeedbackEntry[];
  submit: (entry: NewFeedbackInput) => void;
  clear: () => void;
  exportJson: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<FeedbackEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as FeedbackEntry[];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      entries,
      submit: (entry) => {
        setEntries((current) => [
          {
            ...entry,
            id: `feedback-${crypto.randomUUID()}`,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      },
      clear: () => setEntries([]),
      exportJson: () => {
        const blob = new Blob([JSON.stringify(entries, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "feedback-export.json";
        anchor.click();
        URL.revokeObjectURL(url);
      },
    }),
    [entries]
  );

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used inside FeedbackProvider");
  }
  return context;
}
