"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, MapPin } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { Magnetic } from "@/components/ui/magnetic";
import { Link } from "@/i18n/navigation";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const MotionLink = motion.create(Link);

/** Entrata a cascata: ogni figlio parte 60ms dopo il precedente. */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

export function Hero() {
  const t = useTranslations("hero");
  const proof = t.raw("proof") as string[];

  return (
    <StackedSection className="mt-3 flex items-center sm:mt-4 md:mt-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 sm:py-28"
      >
        <motion.p
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground-muted"
        >
          <MapPin className="size-3.5" aria-hidden />
          {t("eyebrow")}
        </motion.p>

        <motion.h1
          variants={item}
          className="text-center text-4xl font-bold tracking-[-0.03em] text-balance text-foreground sm:text-6xl md:text-7xl"
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-center text-lg leading-relaxed text-pretty text-foreground-muted"
        >
          {t("subline")}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <MotionLink
              href="/#contatti"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-pill bg-brand px-6 py-3 text-sm font-medium text-brand-foreground"
            >
              {t("ctaPrimary")}
            </MotionLink>
          </Magnetic>
          <MotionLink
            href="/#lavori"
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center rounded-pill border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60"
          >
            {t("ctaSecondary")}
          </MotionLink>
        </motion.div>

        {/* Le tre cose che un cliente vuole sapere prima di scrivere, sopra la
            piega: quando gli rispondiamo, di chi è il codice, con chi parla. */}
        <motion.ul
          variants={item}
          className="mt-12 flex flex-col items-center gap-3 text-sm text-foreground-muted sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2"
        >
          {proof.map((line) => (
            <li key={line} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden />
              {line}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </StackedSection>
  );
}
