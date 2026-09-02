import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { Approach } from "@/components/sections/approach";
import { Process } from "@/components/sections/process";
import { TechStack } from "@/components/sections/tech-stack";
import { Guarantees } from "@/components/sections/guarantees";
import CtaSection from "@/components/utils/cta-section";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howWeWork" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/come-lavoriamo`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/come-lavoriamo`]),
      ),
    },
    openGraph: {
      type: "website",
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

/**
 * `/come-lavoriamo`.
 *
 * L'ordine è l'argomentazione di chi sta valutando se firmare, non un indice:
 * prima gli togliamo il peso di dosso (`Approach`: la parte difficile la
 * gestiamo noi), poi rispondiamo subito alle domande che non farebbe ad alta
 * voce (`Guarantees`: di chi è il codice, e se sparite?), poi mostriamo cosa
 * succederà settimana per settimana (`Process`), e solo alla fine arriva la
 * tecnologia (`TechStack`) — che qui non è una vetrina di loghi ma la prova di
 * quanto appena promesso, cioè che nessuno resta in ostaggio.
 *
 * Le garanzie stanno per seconde e non per terze anche per una ragione di
 * forma: `Approach` e `Process` sono entrambe su `--surface-alt`, e messe una
 * di fila all'altra si fonderebbero in un unico blocco beige alto due schermi.
 * Alternate con `Guarantees` in mezzo, la pagina torna a respirare.
 *
 * `Approach` e `TechStack` stavano in home: erano le due sezioni che ripetevano
 * argomenti già coperti dall'hero e dalle FAQ, e qui invece hanno un ruolo.
 * `Process` resta in entrambe, ma in due tagli diversi — vedi il commento in
 * `components/sections/process.tsx`.
 */
export default async function HowWeWorkPage() {
  const t = await getTranslations("howWeWork");

  return (
    <>
      <StackedSection>
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="mx-auto mb-6 w-fit rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-sm uppercase tracking-wider shadow-xl shadow-border/70">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 text-pretty text-foreground-muted">{t("subtitle")}</p>
          </Reveal>
        </div>
      </StackedSection>

      <Approach />
      <Guarantees />
      <Process variant="full" />
      <TechStack />

      <StackedSection className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div>
            <h2 className="text-4xl font-bold tracking-[-0.02em] text-balance text-foreground">
              {t("ctaTitle")}
            </h2>
            <p className="mt-5 text-pretty text-foreground-muted">{t("ctaText")}</p>
          </div>
          <CtaSection
            textSettings={{
              eyebrow: t("cta.eyebrow"),
              title: t("cta.title"),
              text: t("cta.text"),
              button: t("cta.button"),
              buttonSecondary: t("cta.buttonSecondary"),
            }}
          />
        </div>
      </StackedSection>
    </>
  );
}
