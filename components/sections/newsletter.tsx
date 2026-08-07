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
      data-cursor-invert
      className="bg-brand rounded-t-none! text-brand-foreground absolute w-full -bottom-20 z-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-32 mt-20 md:flex-row sm:items-center md:justify-between md:gap-12"
      >
        <div className="w-fit mr-auto">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-brand-foreground/20 bg-brand-foreground/10 px-3 py-1 font-mono text-sm uppercase tracking-wider">
            <Mail className="size-3.5" aria-hidden />
            {t("title")}
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] md:text-4xl">
            {t("headline")}
          </h2>
          <p className="mt-3 text-brand-foreground/80">{t("subtitle")}</p>
        </div>

        <div className="w-full max-w-fit mr-auto shrink-0">
          <NewsletterForm />
        </div>
      </motion.div>
    </StackedSection>
  );
}
