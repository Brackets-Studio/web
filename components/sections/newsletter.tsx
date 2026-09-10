"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Sta in fondo alla home, subito dopo il modulo di contatto — ed è per questo
 * che è deliberatamente più piccola di tutto il resto: chiede molto meno del
 * form che ha sopra, e non deve competerci. Titolo di una taglia sotto, niente
 * occhiello a pastiglia, una riga sola da desktop.
 *
 * Prima viveva DENTRO `Contact`, in `position: absolute` con `-bottom-32` e un
 * `pb-60 md:pb-56 lg:pb-46` sul genitore a tenerle il posto: cinque numeri
 * tarati a mano sull'altezza del contenuto di allora, che si scavallavano
 * appena il copy cambiava di una riga. Ora è una sezione come le altre, in
 * flusso, e l'altezza se la calcola il browser.
 */
export function Newsletter() {
  const t = useTranslations("newsletter");

  return (
    <StackedSection id="newsletter" className="bg-background-elevated border border-border max-w-7xl! mt-16 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="mx-auto flex flex-col gap-6 px-10 py-14 md:flex-row md:items-center md:justify-between md:gap-12"
      >
        <div className="max-w-md">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-foreground-muted">
            <Mail className="size-3.5" aria-hidden />
            {t("title")}
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-balance text-foreground md:text-2xl">
            {t("headline")}
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">{t("subtitle")}</p>
        </div>

        <div className="w-full shrink-0 md:w-auto">
          <NewsletterForm />
        </div>
      </motion.div>
    </StackedSection>
  );
}
