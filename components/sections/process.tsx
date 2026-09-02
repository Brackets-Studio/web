"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, Clock, Package } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Link } from "@/i18n/navigation";

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
  /** Solo nella variante `full`: cosa succede davvero, quanto dura, cosa resta. */
  detail: string;
  duration: string;
  deliverable: string;
};

/**
 * Il processo in tre passi, in due tagli.
 *
 * Vive in due pagine — la home e `/come-lavoriamo` — e renderizzarlo identico
 * in tutte e due sarebbe contenuto duplicato per Google e una ripetizione
 * noiosa per chi arriva sulla seconda dopo aver letto la prima. Quindi:
 *
 * - `teaser` (home): argomento di vendita. Tre righe su un filetto, l'illustra-
 *   zione ridotta a un segno da 56px invece del banner, e un link alla pagina
 *   per chi vuole i dettagli. Deve rassicurare in dieci secondi, non spiegare.
 * - `full` (/come-lavoriamo): documentazione. Le card con le illustrazioni, più
 *   cosa succede in ogni fase, quanto dura e cosa resta in mano — che è la
 *   domanda vera di chi sta per firmare.
 *
 * `title` e `description` sono condivise; `detail`, `duration` e `deliverable`
 * servono solo a `full`.
 */
export function Process({ variant = "full" }: { variant?: "teaser" | "full" }) {
  const t = useTranslations("process");

  if (variant === "teaser") {
    return (
      <StackedSection id="processo" className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

          <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEP_KEYS.map((key, index) => {
              const raw = t.raw(`steps.${key}`) as StepRaw;
              return (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.35, delay: index * 0.08, ease: EASE_OUT }}
                  className="border-t border-border pt-5"
                >
                  {/* Stessa illustrazione della variante `full`, ridotta a un
                      segno: la card lì è un banner da 176px, qui è un'icona.
                      Le due sezioni restano distinguibili senza sprecare
                      l'asset. */}
                  <Image
                    src={STEP_IMAGES[key]}
                    alt=""
                    width={112}
                    height={112}
                    sizes="56px"
                    className="h-14 w-auto object-contain object-left"
                  />
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="font-mono text-sm text-brand tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                      {raw.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-foreground-muted">{raw.description}</p>
                </motion.li>
              );
            })}
          </ol>

          <div className="mt-12 flex justify-center">
            <Link
              href="/come-lavoriamo"
              className="group inline-flex items-center gap-2 rounded-pill border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60"
            >
              {t("moreLink")}
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </StackedSection>
    );
  }

  return (
    <StackedSection id="processo" className="bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

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
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
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

                <div className="flex flex-1 flex-col border-t border-border px-6 py-5">
                  <h3 className="text-lg font-semibold tracking-[-0.01em] text-foreground">
                    {raw.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground-muted">{raw.description}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground-muted">
                    {raw.detail}
                  </p>

                  {/* Le due domande di chi sta per firmare: quanto dura, e cosa
                      mi resta in mano quando finisce. */}
                  <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-xs">
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">{t("durationLabel")}</dt>
                      <Clock className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                      <dd className="text-foreground-muted">{raw.duration}</dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">{t("deliverableLabel")}</dt>
                      <Package className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                      <dd className="text-foreground-muted">{raw.deliverable}</dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StackedSection>
  );
}
