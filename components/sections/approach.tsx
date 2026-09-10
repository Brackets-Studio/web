"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { StackedSection } from "@/components/layout/stacked-section";
import Image from "next/image";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Approach() {
  const t = useTranslations("approach");
  const imageFrameRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageFrameRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <StackedSection className="relative flex min-h-[70vh] items-center overflow-hidden bg-surface-alt border border-border">
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          y: gridY,
          backgroundImage:
            "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent-brand/25 bg-accent-brand/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground"
          >
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            {t("eyebrow")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05, ease: EASE_OUT }}
            className="max-w-3xl text-3xl font-bold tracking-[-0.02em] text-balance sm:text-4xl md:text-5xl"
          >
            {t("headline")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT }}
            className="mt-6 max-w-md text-lg leading-relaxed text-foreground-muted"
          >
            {t("body")}
          </motion.p>
        </div>

        <motion.div
          ref={imageFrameRef}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-border shadow-md"
        >
          <motion.div
            style={{ y: imageY }}
            className="absolute inset-[-10%] flex items-center justify-center bg-linear-to-br from-neutral-300/60 via-neutral-200/40 to-neutral-100 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950"
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <Image
              src="/assets/approach-image.png"
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </motion.div>
        </motion.div>
      </div>
    </StackedSection>
  );
}
