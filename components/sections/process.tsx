"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { StackedSection } from "@/components/layout/stacked-section";

const STEP_KEYS = ["discovery", "build", "launch"] as const;

const STEP_IMAGES = {
  discovery: "/processes/chatting.png",
  build: "/processes/building.png",
  launch: "/processes/launching.png",
} as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type StepRaw = {
  title: string;
  description: string;
};

export function Process() {
  const t = useTranslations("process");

  return (
    <StackedSection id="processo">
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
          {STEP_KEYS.map((key, index) => {
            const raw = t.raw(`steps.${key}`) as StepRaw;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: index * 0.08, ease: EASE_OUT }}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background-elevated shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-md"
              >
                {/* Banner immagine full-bleed in cima */}
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-linear-to-br from-muted/50 to-transparent">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  <span className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-border bg-background/70 px-2.5 py-1 font-mono text-sm text-brand backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-brand" />
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Image
                    src={STEP_IMAGES[key]}
                    alt=""
                    width={220}
                    height={220}
                    sizes="(min-width: 640px) 20vw, 60vw"
                    className="h-32 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="px-6 py-4 border-t border-border">
                  <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                    {raw.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted">{raw.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StackedSection>
  );
}
