"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Search } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { useRouter } from "@/i18n/navigation";

/**
 * Il gancio in homepage per `/analisi`.
 *
 * L'analisi vera gira solo sulla sua pagina — qui c'è solo il campo, perché è
 * il campo a far partire la cosa: chi legge "quanto è messo male il tuo sito?"
 * e trova subito dove scriverlo lo fa, chi trova un link "scopri di più" no.
 * Quello che viene scritto passa a `/analisi` nella query, e lì l'analisi
 * parte da sola: chi ha già premuto invio una volta non deve premerlo due.
 */
export function AnalyzerCta() {
  const t = useTranslations("analyze");
  const router = useRouter();
  const [url, setUrl] = useState("");

  return (
    <StackedSection className="bg-background-elevated border border-border">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
        <Reveal className="flex flex-col items-center text-center">
          <p className="mb-5 w-fit rounded-full border border-accent-brand/25 bg-accent-brand/10 px-3 py-1 font-mono text-xs tracking-wider text-foreground uppercase">
            {t("home.eyebrow")}
          </p>
          <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            {t("home.title")}
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-foreground-muted">{t("home.subtitle")}</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = url.trim();
              router.push(trimmed ? `/analisi?url=${encodeURIComponent(trimmed)}` : "/analisi");
            }}
            className="mt-9 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="home-url" className="sr-only">
              {t("form.label")}
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground-muted"
                aria-hidden
              />
              <input
                id="home-url"
                name="url"
                type="text"
                inputMode="url"
                spellCheck={false}
                autoComplete="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={t("form.placeholder")}
                className="w-full rounded-pill border border-border bg-background py-3 pr-4 pl-11 text-base text-foreground outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("home.cta")}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>

          <p className="mt-3 text-xs text-foreground-muted">{t("home.hint")}</p>
        </Reveal>
      </div>
    </StackedSection>
  );
}
