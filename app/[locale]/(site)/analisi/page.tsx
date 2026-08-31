import type { Metadata } from "next";
import { Gauge, Lock, Smartphone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { SiteAnalyzer } from "@/components/sections/site-analyzer";
import { Reveal } from "@/components/ui/reveal";
import { routing } from "@/i18n/routing";

/**
 * Lighthouse su rete mobile simulata impiega 30-60 s, e la server action che
 * lo interroga gira dentro questo segmento: il default (300 s) basta, ma lo
 * dichiariamo perché sia esplicito che questa pagina è volutamente lenta.
 */
export const maxDuration = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "analyze" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/analisi`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/analisi`])),
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

const REASSURANCES = [
  { key: "free" as const, icon: Lock },
  { key: "mobile" as const, icon: Smartphone },
  { key: "google" as const, icon: Gauge },
];

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string | string[] }>;
}) {
  const t = await getTranslations("analyze");
  // `?url=` arriva dal campo in homepage (components/sections/analyzer-cta.tsx):
  // l'analisi parte da sola. Un array significa parametro ripetuto a mano
  // nell'indirizzo: prendiamo il primo e tiriamo dritto.
  const { url } = await searchParams;
  const initialUrl = (Array.isArray(url) ? url[0] : url)?.slice(0, 2000);

  return (
    <StackedSection>
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        <Reveal className="flex flex-col items-center text-center">
          <p className="mb-6 w-fit rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-xs tracking-wider text-foreground-muted uppercase">
            {t("hero.eyebrow")}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-pretty text-foreground-muted">
            {t("hero.subtitle")}
          </p>
        </Reveal>

        <div className="mt-12">
          <SiteAnalyzer initialUrl={initialUrl} />
        </div>

        {/* Le tre obiezioni che una persona si fa prima di incollare il proprio
            indirizzo: quanto mi costa, cosa state misurando, chi lo dice. */}
        <div className="mt-20 grid grid-cols-1 gap-4 pt-12 sm:grid-cols-3">
          {REASSURANCES.map(({ key, icon: Icon }, index) => (
            <Reveal key={key} index={index} className="flex flex-col gap-2 bg-background-elevated p-6 border border-border rounded-3xl">
              <Icon className="size-5 text-brand" aria-hidden />
              <p className="font-medium text-foreground">{t(`reassurance.${key}.title`)}</p>
              <p className="text-sm text-foreground-muted">{t(`reassurance.${key}.body`)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </StackedSection>
  );
}
