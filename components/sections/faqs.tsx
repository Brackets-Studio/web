"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { StackedSection } from "@/components/layout/stacked-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "../ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type FaqRaw = {
  question: string;
  answer: string;
};

export function Faqs() {
  const t = useTranslations("faqs");
  const items = t.raw("items") as FaqRaw[];

  return (
    <StackedSection id="faq">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-12 grid grid-cols-1 items-start gap-6 md:grid-cols-[1.3fr_1fr] md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: 0.1, ease: EASE_OUT }}
            className="w-full min-w-0 rounded-lg border border-border bg-background-elevated shadow-sm"
          >
            <Accordion defaultValue={[0]}>
              {items.map((item, index) => (
                <AccordionItem className="px-4" key={item.question} value={index}>
                  <AccordionTrigger className="text-lg">{item.question}</AccordionTrigger>
                  <AccordionPanel>{item.answer}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: 0.15, ease: EASE_OUT }}
            className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-background-elevated shadow-sm md:sticky md:top-24"
          >
            <div className="flex flex-1 flex-col p-6">
              {/* Volto + identità: dà un riferimento umano alla CTA */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <Image
                    src="/assets/profile.png"
                    alt="Tobia Bartolomei"
                    width={56}
                    height={56}
                    className="size-14 rounded-full object-cover ring-2 ring-border"
                  />
                  <span className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-background-elevated bg-brand" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Tobia Bartolomei</p>
                  <p className="text-xs text-foreground-muted">Bracket Studio</p>
                </div>
              </div>

              <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em] text-foreground">
                {t("cta.title")}
              </h3>
              <p className="mt-2 flex-1 text-sm text-foreground-muted">
                {t("cta.text")}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  render={<Link href="/#contatti" />}
                  nativeButton={false}
                  className="w-full justify-center"
                >
                  {t("cta.button")}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-foreground-muted">
                  <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                  {t("cta.response")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </StackedSection>
  );
}
