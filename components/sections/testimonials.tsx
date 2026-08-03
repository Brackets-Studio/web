"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type TestimonialRaw = {
  quote: string;
  name: string;
  role: string;
};

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as TestimonialRaw[];

  return (
    <StackedSection id="testimonianze" >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <p className="mb-6 w-fit uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((item, index) => (
            <motion.figure
              key={item.name + index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: index * 0.08, ease: EASE_OUT }}
              className="flex flex-col rounded-lg border border-border bg-background-elevated p-6 shadow-sm"
            >
              <Quote className="size-5 text-brand" strokeWidth={1.75} />
              <blockquote className="mt-4 flex-1 text-sm text-foreground">
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-foreground-muted">{item.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </StackedSection>
  );
}
