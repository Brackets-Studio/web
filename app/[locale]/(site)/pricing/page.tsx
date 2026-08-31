import type { Metadata } from "next";
import { CalendarClock, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { QuoteCalculator } from "@/components/sections/quote-calculator";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";
import { getPricingSettings } from "@/sanity/pricing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/pricing`])),
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, settings] = await Promise.all([
    getTranslations("pricing"),
    getPricingSettings(locale),
  ]);

  const services = settings?.services ?? [];
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <>
      <StackedSection>
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mx-auto mb-6 w-fit tracking-wider uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-foreground-muted">{t("subtitle")}</p>
          </Reveal>

          {services.length > 0 && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-4">
              {services.map((service, index) => (
                <Reveal
                  key={service.key}
                  index={index}
                  className="flex flex-col rounded-lg border border-border bg-background-elevated p-6 shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-foreground">{service.name}</h2>
                  <p className="mt-2 font-mono text-2xl font-bold text-brand">
                    {currency.format(service.basePrice)}
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    ~{service.baseTimelineWeeks} {locale === "it" ? "settimane" : "weeks"}
                  </p>
                  {service.description && (
                    <p className="mt-4 text-sm text-foreground-muted">{service.description}</p>
                  )}
                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {service.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          )}

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-foreground-muted">
            {t("note")}
          </p>

          {settings && (
            <div id="preventivo" className="mt-16 scroll-mt-24">
              <QuoteCalculator settings={settings} locale={locale} />
            </div>
          )}

          <Reveal className="mt-16 rounded-lg border border-border bg-background-elevated p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">{t("cta.title")}</h2>
            <p className="mt-2 text-sm text-foreground-muted">{t("cta.text")}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={siteConfig.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[100px] bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <CalendarClock className="size-4" aria-hidden />
                {t("cta.button")}
              </a>
              <Link
                href="/#contatti"
                className="inline-flex items-center rounded-[100px] border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand"
              >
                {t("cta.buttonSecondary")}
              </Link>
            </div>
          </Reveal>
        </div>
      </StackedSection>
    </>
  );
}
