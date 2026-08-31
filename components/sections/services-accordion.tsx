"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import type { ServiceListItem } from "@/sanity/types";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Stessa interattività di prima (accordion a singola apertura, immagine
 * accoppiata alla voce aperta), ma parametrizzata dai `service` fetchati da
 * Sanity invece delle chiavi hardcoded.
 */
export function ServicesAccordion({ items }: { items: ServiceListItem[] }) {
  const [openSlug, setOpenSlug] = useState<string | undefined>(items[0]?.slug);
  const openItem = items.find((item) => item.slug === openSlug) ?? items[0];

  if (!openItem) return null;

  return (
    <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35, delay: 0.1, ease: EASE_OUT }}
        className="order-2 rounded-lg border border-border bg-background-elevated/60 shadow-sm lg:order-1"
      >
        <Accordion
          value={[openSlug]}
          onValueChange={(value) => {
            const next = (value as string[]).find((slug) => slug !== openSlug);
            if (next) setOpenSlug(next);
          }}
        >
          {items.map((item) => (
            <AccordionItem key={item.slug} value={item.slug}>
              <AccordionTrigger className="px-4 text-lg">{item.title}</AccordionTrigger>
              <AccordionPanel className="px-4">
                <p>{item.detail.summary}</p>
                <ul className="mt-3 space-y-2">
                  {item.detail.highlights.map((highlight) => (
                    <li key={highlight.text} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      {highlight.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag.text}>{tag.text}</Badge>
                  ))}
                </div>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35, delay: 0.15, ease: EASE_OUT }}
        className="relative order-1 flex h-112 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background-elevated/60 lg:order-2"
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
          {openItem.heroImage?.asset && (
            <motion.div
              key={openItem.slug}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="relative flex h-full w-full items-center justify-center p-10"
            >
              <Image
                src={urlFor(openItem.heroImage).width(520).height(520).url()}
                alt={openItem.heroImage.alt ?? ""}
                width={520}
                height={520}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="h-auto w-full max-w-95 object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
