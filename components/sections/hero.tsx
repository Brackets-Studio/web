"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Check, MapPin, Phone } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

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
    <StackedSection className="flex items-center rounded-t-none!">
      {/*
       * Fascia tokenizzata, non più fissa.
       *
       * La hero aveva un fondo scritto a mano (#141210) uguale nei due temi:
       * restava scura anche col tema chiaro attivo, letto come bug — una
       * sezione che ignora il toggle chiaro/scuro invece di seguirlo. Ora il
       * fondo è `--hero-bg` (sabbia calda in chiaro, lo stesso inchiostro
       * `#141210` di prima in scuro) e testo/badge usano `--hero-foreground*`
       * invece di bianco fisso, così restano leggibili in entrambi i temi.
       *
       * I due glow radiali usano `--brand`/`--accent-brand` con `color-mix`
       * invece di un hex fisso, così la tinta segue comunque la palette del
       * tema attivo. La percentuale del mix è `--hero-glow-strength`: sul
       * fondo scuro il 45% si vede bene, sullo stesso 45% su fondo sabbia i
       * glow sono quasi invisibili — il token vale 70% in chiaro.
       *
       * `mask-image` sfuma l'opacità del riempimento nei primi ~120px: è la
       * "sfumatura sul bordo superiore" richiesta. Un `backdrop-filter: blur()`
       * qui non produrrebbe nulla — dietro c'è solo il colore piatto della
       * pagina, sfocare un colore piatto restituisce lo stesso colore — quindi
       * serve una maschera che dissolve il fondo verso l'alto, non un blur.
       * I glow restano dentro la maschera: si affievoliscono col fondo invece
       * di sparire di netto.
       */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--hero-bg)",
          backgroundImage: [
            "radial-gradient(ellipse 60% 50% at 0% 0%, color-mix(in oklch, var(--brand) var(--hero-glow-strength), transparent), transparent 70%)",
            "radial-gradient(ellipse 60% 50% at 100% 100%, color-mix(in oklch, var(--accent-brand) var(--hero-glow-strength), transparent), transparent 70%)",
          ].join(", "),
          maskImage: "linear-gradient(to bottom, transparent, black 120px)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 120px)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 sm:py-28"
      >
        <motion.p
          variants={item}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-hero-foreground/15 bg-hero-foreground/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-hero-foreground"
        >
          <MapPin className="size-3.5" aria-hidden />
          {t("eyebrow")}
        </motion.p>

        {/* Qui sta il telefono e basta.
         *
         * Il numero c'era già in `lib/site.ts`, ma lo vedeva solo chi atterrava
         * su una landing verticale: in home — dove arriva la linea commessa, che
         * ha il ticket più alto — non compariva da nessuna parte. È un `tel:`
         * perché da telefono la riga si tocca, non si trascrive.
         *
         * Indirizzo e P.IVA NON stanno qui: sono la parte burocratica della
         * stessa domanda, si cercano a fine pagina e vivono in `Contact` e nel
         * footer. Sotto il titolo ruberebbero solo lo spazio che serve alla CTA
         * — e "Pesaro" lo dice già l'occhiello qui sopra. */}
        <motion.p variants={item} className="mb-6">
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-hero-foreground-muted transition-colors hover:text-hero-foreground"
          >
            <Phone className="size-3.5" aria-hidden />
            {siteConfig.phone}
          </a>
        </motion.p>

        <motion.h1
          variants={item}
          className="text-center text-4xl font-bold tracking-[-0.03em] text-balance text-hero-foreground sm:text-6xl md:text-7xl"
        >
          {t("headline")}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-center text-lg leading-relaxed text-pretty text-hero-foreground-muted"
        >
          {t("subline")}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <MotionLink
            href="/#contatti"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center rounded-pill bg-brand px-6 py-3 text-sm font-medium text-brand-foreground"
          >
            {t("ctaPrimary")}
          </MotionLink>
        </motion.div>

        {/* Le tre cose che un cliente vuole sapere prima di scrivere, sopra la
            piega: quando gli rispondiamo, di chi è il codice, con chi parla. */}
        <motion.ul
          variants={item}
          className="mt-12 flex flex-col items-center gap-3 text-sm text-hero-foreground-muted sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2"
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
