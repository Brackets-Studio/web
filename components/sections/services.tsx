"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { StackedSection } from "@/components/layout/stacked-section";

const SERVICE_KEYS = ["web", "mobile", "ai", "cloud"] as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type ServiceRaw = {
  title: string;
  description: string;
  tags: string[];
  detail: { summary: string; highlights: string[] };
};

export function Services() {
  const t = useTranslations("services");

  return (
    <StackedSection id="servizi" className="bg-neutral-200/20 dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <p className="mb-6 w-fit tracking-wider uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
              {t("eyebrow")}
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
            <a
              href="#contatti"
              className="mt-8 inline-flex items-center rounded-[100px] bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("cta")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: 0.1, ease: EASE_OUT }}
            className="rounded-lg border border-border bg-background-elevated shadow-sm"
          >
            <Accordion defaultValue={["web"]}>
              {SERVICE_KEYS.map((key) => {
                const raw = t.raw(`items.${key}`) as ServiceRaw;
                return (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger className='px-4'>{raw.title}</AccordionTrigger>
                    <AccordionPanel className='px-4'>
                      <p>{raw.detail.summary}</p>
                      <ul className="mt-3 space-y-2">
                        {raw.detail.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-center gap-2 text-sm">
                            <span className="mt-0.5 size-1 shrink-0 rounded-full bg-brand" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {raw.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </StackedSection>
  );
}
