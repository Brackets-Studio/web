"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Search, Layers, Rocket } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";

const STEP_KEYS = ["discovery", "build", "launch"] as const;

const STEP_ICONS = {
  discovery: Search,
  build: Layers,
  launch: Rocket,
} as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type StepRaw = {
  title: string;
  description: string;
};

export function Process() {
  const t = useTranslations("process");

  return (
    <StackedSection id="processo">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <p className="mb-6 w-fit uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEP_KEYS.map((key, index) => {
            const raw = t.raw(`steps.${key}`) as StepRaw;
            const Icon = STEP_ICONS[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: EASE_OUT }}
                className="rounded-lg relative border border-border bg-background-elevated p-6 shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-md border border-border bg-muted/50 font-mono text-xs text-brand">
                  <Icon className="size-4.5" strokeWidth={1.75} />
                </div>
                <span className="absolute top-4 right-4 block font-mono text-4xl text-foreground-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {raw.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">{raw.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StackedSection>
  );
}
