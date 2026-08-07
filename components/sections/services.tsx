"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { StackedSection } from "@/components/layout/stacked-section";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

const SERVICE_KEYS = ["web", "mobile", "ai", "cloud"] as const;
type ServiceKey = (typeof SERVICE_KEYS)[number];

const SERVICE_IMAGES: Record<ServiceKey, string> = {
  web: "/services/web-dev.png",
  mobile: "/services/mobile-dev.png",
  ai: "/services/ai-dev.png",
  cloud: "/services/cloud-dev.png",
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type ServiceRaw = {
  title: string;
  description: string;
  tags: string[];
  detail: { summary: string; highlights: string[] };
};

export function Services() {
  const t = useTranslations("services");
  // Accordion controllato a singola apertura: base-ui permette apertura multipla,
  // quindi teniamo noi una sola chiave attiva così l'immagine a lato è sempre
  // accoppiata alla voce aperta (e non resta mai vuota).
  const [openKey, setOpenKey] = useState<ServiceKey>("web");

  return (
    <StackedSection id="servizi" className="bg-neutral-200/20 dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        {/* Header in alto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="max-w-2xl"
        >
          <p className="mb-6 w-fit tracking-wider uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 text-foreground-muted">{t("subtitle")}</p>
        </motion.div>

        {/* Accordion (testo) a sinistra, immagine attiva a destra.
            Su mobile l'immagine va sopra l'accordion (order). */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: 0.1, ease: EASE_OUT }}
            className="order-2 rounded-lg border border-border bg-background/60 shadow-sm lg:order-1"
          >
            <Accordion
              value={[openKey]}
              onValueChange={(value) => {
                const next = (value as ServiceKey[]).find((key) => key !== openKey);
                if (next) setOpenKey(next);
              }}
            >
              {SERVICE_KEYS.map((key) => {
                const raw = t.raw(`items.${key}`) as ServiceRaw;
                return (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger className="px-4 text-lg">{raw.title}</AccordionTrigger>
                    <AccordionPanel className="px-4">
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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: 0.15, ease: EASE_OUT }}
            className="relative order-1 flex min-h-60 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background/60 lg:order-2"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={openKey}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="relative flex h-full w-full items-center justify-center p-10"
              >
                <Image
                  src={SERVICE_IMAGES[openKey]}
                  alt=""
                  width={520}
                  height={520}
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="h-auto w-full max-w-95 object-contain"
                  priority={openKey === "web"}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CTA sotto tutto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, delay: 0.2, ease: EASE_OUT }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/#contatti"
            className="inline-flex items-center rounded-[100px] bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("cta")}
          </Link>
        </motion.div>
        </div>
    </StackedSection>
  );
}
