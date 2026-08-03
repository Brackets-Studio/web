"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import type { DetailItem } from "@/components/detail/detail-context";
import { StackedSection } from "@/components/layout/stacked-section";

const CASE_STUDY_KEYS = ["smartables"] as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type CaseStudyRaw = {
  name: string;
  problem: string;
  solution: string;
  result: string;
  tags: string[];
  image?: string;
  detail: { summary: string; highlights: string[] };
};

export function CaseStudies() {
  const t = useTranslations("caseStudies");

  return (
    <StackedSection id="case-study" className="bg-neutral-200/20 dark:bg-neutral-900">

      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDY_KEYS.map((key, index) => {
            const raw = t.raw(`items.${key}`) as CaseStudyRaw;
            const item: DetailItem = {
              id: `case-${key}`,
              kind: "case-study",
              title: raw.name,
              tags: raw.tags,
              detail: raw.detail,
              image: raw.image,
              problem: raw.problem,
              solution: raw.solution,
              result: raw.result,
              problemLabel: t("problem"),
              solutionLabel: t("solution"),
              resultLabel: t("result"),
            };
            return <CaseStudyCard key={key} item={item} index={index} />;
          })}
        </div>
      </div>
    </StackedSection>
  );
}
