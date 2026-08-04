"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { StackedSection } from "@/components/layout/stacked-section";
import { Magnetic } from "@/components/ui/magnetic";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const t = useTranslations("hero");

  return (
    <StackedSection className="mt-3 flex min-h-[55vh] items-center sm:mt-4 md:mt-6">
      <div className="mx-auto w-full flex max-w-6xl px-6 flex-col items-center py-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="mb-6 uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border"
        >
          {t("eyebrow")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: EASE_OUT }}
          className="max-w-5xl text-center text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl md:text-7xl"
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
          className="mt-6 max-w-xl text-center text-lg text-foreground-muted"
        >
          {t("subline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE_OUT }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Magnetic>
            <motion.a
              href="#contatti"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-[100px] bg-brand px-6 py-3 text-sm font-medium text-brand-foreground"
            >
              {t("ctaPrimary")}
            </motion.a>
          </Magnetic>
          <motion.a
            href="#case-study"
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center rounded-[100px] border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand"
          >
            {t("ctaSecondary")}
          </motion.a>
        </motion.div>
      </div>
    </StackedSection>
  );
}
