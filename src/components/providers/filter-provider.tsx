"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { DEFAULT_FILTERS } from "@/lib/constants";
import { type FilterState } from "@/lib/types";

interface FilterContextValue {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setFilter: (key, value) =>
        setFilters((current) => ({
          ...current,
          [key]: value,
        })),
      resetFilters: () => setFilters(DEFAULT_FILTERS),
    }),
    [filters]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used inside FilterProvider");
  }
  return context;
}
