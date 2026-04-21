"use client";

import { FilterProvider } from "@/components/providers/filter-provider";
import { FeedbackProvider } from "@/components/providers/feedback-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <FeedbackProvider>{children}</FeedbackProvider>
    </FilterProvider>
  );
}
