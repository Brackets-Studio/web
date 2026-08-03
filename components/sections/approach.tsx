"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { StackedSection } from "@/components/layout/stacked-section";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Approach() {
  const t = useTranslations("approach");

  return (
    <StackedSection className="relative flex min-h-[70vh] items-center overflow-hidden bg-neutral-200/20 dark:bg-neutral-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 sm:py-28 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-sm text-brand backdrop-blur-sm"
          >
            <span className="size-1.5 rounded-full bg-brand" />
            {t("eyebrow")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05, ease: EASE_OUT }}
            className="max-w-3xl text-4xl font-semibold tracking-[-0.02em] sm:text-5xl md:text-6xl"
          >
            {t("headline")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            {t("body")}
          </motion.p>
        </div>

      </div>
    </StackedSection>
  );
}
