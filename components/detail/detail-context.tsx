"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type DetailItem = {
  id: string;
  kind: "service" | "case-study";
  title: string;
  tags: string[];
  detail: { summary: string; highlights: string[] };
  description?: string;
  problem?: string;
  solution?: string;
  result?: string;
  problemLabel?: string;
  solutionLabel?: string;
  resultLabel?: string;
  /** Cover image for a case study card. Falls back to a monogram when absent. */
  image?: string;
  client?: string;
};

type DetailContextValue = {
  activeItem: DetailItem | null;
  triggerEl: HTMLElement | null;
  open: (item: DetailItem, trigger: HTMLElement | null) => void;
  close: () => void;
};

const DetailContext = createContext<DetailContextValue | null>(null);

export function DetailProvider({ children }: { children: ReactNode }) {
  const [activeItem, setActiveItem] = useState<DetailItem | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);

  const open = useCallback((item: DetailItem, trigger: HTMLElement | null) => {
    setActiveItem(item);
    setTriggerEl(trigger);
  }, []);

  const close = useCallback(() => {
    setActiveItem(null);
  }, []);

  return (
    <DetailContext.Provider value={{ activeItem, triggerEl, open, close }}>
      {children}
    </DetailContext.Provider>
  );
}

export function useDetail() {
  const context = useContext(DetailContext);
  if (!context) {
    throw new Error("useDetail must be used within a DetailProvider");
  }
  return context;
}
