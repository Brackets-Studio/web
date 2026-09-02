import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { LabCard } from "@/components/ui/lab-card";
import { routing } from "@/i18n/routing";
import { sanityFetch } from "@/sanity/client";
import { LAB_ITEMS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { LabItem } from "@/sanity/types";
import CtaSection from "@/components/utils/cta-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lab" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/lab`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/lab`])),
    },
  };
}

export default async function LabPage() {
  const locale = await getLocale();
  const t = await getTranslations("lab");

  const items = await sanityFetch<LabItem[]>({
    query: LAB_ITEMS_QUERY,
    params: { locale },
    tags: ["labItem"],
  });

  return (
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

        {items.length === 0 ? (
          <Reveal className="mx-auto mt-16 max-w-md rounded-lg border border-border bg-background-elevated p-8 text-center">
            <p className="text-base font-semibold text-foreground">{t("empty.title")}</p>
            <p className="mt-2 text-sm text-foreground-muted">{t("empty.body")}</p>
          </Reveal>
        ) : (
          <div
            className={`mt-16 grid grid-cols-1 gap-6 ${
              items.length === 1 ? "" : items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {items.map((item, index) => (
              <LabCard
                key={item.id}
                headingLevel="h2"
                title={item.title}
                kindLabel={t(`kinds.${item.kind}`)}
                statusLabel={item.status === "wip" ? t("status.wip") : undefined}
                description={item.shortDescription}
                tags={item.tags}
                image={
                  item.image?.asset
                    ? urlFor(item.image).width(800).height(500).fit("crop").url()
                    : undefined
                }
                demoUrl={item.demoUrl}
                repoUrl={item.repoUrl}
                demoLabel={t("viewDemo")}
                repoLabel={t("viewRepo")}
                index={index}
              />
            ))}
          </div>
        )}

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
  );
}
