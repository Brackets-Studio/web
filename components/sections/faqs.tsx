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
      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="text-left flex flex-col items-start"
        >
          <p className="mb-6 w-fit uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 md:grid-cols-[1.3fr_1fr] md:gap-8">
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
                  <AccordionTrigger>{item.question}</AccordionTrigger>
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
            className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-background-elevated shadow-sm"
          >
            <div className="flex flex-1 flex-col p-6">
              <div className="relative h-28 shrink-0">
                <Image src="/profile.png" alt="Tobia Bartolomei" width={100} height={100} className="rounded-full" />
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                {t("cta.title")}
              </h3>
              <p className="mt-2 flex-1 text-sm text-foreground-muted">
                {t("cta.text")}
              </p>
              <div className='flex items-center gap-4 mt-6'>
                <Button
                  render={<Link href="/#contatti" />}
                  nativeButton={false}
                  className="w-fit"
                >
                  {t("cta.button")}
                </Button>
                <p className="flex items-center gap-1.5 text-xs text-foreground-muted">
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
