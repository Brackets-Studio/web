"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Newsletter() {
  const t = useTranslations("newsletter");

  return (
    <StackedSection
      id="newsletter"
      className="absolute -bottom-20 z-10 w-full rounded-t-none! border-t border-border bg-[#e2e0d9] dark:bg-neutral-800/70"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-32 mt-20 md:flex-row sm:items-center md:justify-between md:gap-12"
      >
        <div className="w-fit mr-auto">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground-muted">
            <Mail className="size-3.5" aria-hidden />
            {t("title")}
          </p>
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-balance text-foreground md:text-3xl">
            {t("headline")}
          </h2>
          <p className="mt-3 max-w-md text-sm text-foreground-muted">{t("subtitle")}</p>
        </div>

        <div className="w-full max-w-fit mr-auto shrink-0">
          <NewsletterForm />
        </div>
      </motion.div>
    </StackedSection>
  );
}
