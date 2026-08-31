import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import { routing } from "@/i18n/routing";
import { sanityFetch } from "@/sanity/client";
import { CASE_STUDIES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { CaseStudyListItem } from "@/sanity/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "caseStudies" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/work`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/work`])),
    },
  };
}

export default async function WorkPage() {
  const locale = await getLocale();
  const t = await getTranslations("caseStudies");

  const caseStudies = await sanityFetch<CaseStudyListItem[]>({
    query: CASE_STUDIES_QUERY,
    params: { locale },
    tags: ["caseStudy"],
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

        {caseStudies.length === 0 ? (
          <Reveal className="mx-auto mt-16 max-w-md rounded-lg border border-border bg-background-elevated p-8 text-center">
            <p className="text-base font-semibold text-foreground">{t("empty.title")}</p>
            <p className="mt-2 text-sm text-foreground-muted">{t("empty.body")}</p>
          </Reveal>
        ) : (
          <div
            className={`mt-16 grid grid-cols-1 gap-6 ${
              caseStudies.length === 1
                ? ""
                : caseStudies.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >

            {caseStudies.map((caseStudy, index) => (
              <CaseStudyCard
                key={caseStudy.id}
                slug={caseStudy.slug}
                title={caseStudy.name}
                tags={caseStudy.tags ?? []}
                result={caseStudy.result}
                resultLabel={t("result")}
                viewLabel={t("viewCaseStudy")}
                image={
                  caseStudy.mainImage?.asset
                    ? urlFor(caseStudy.mainImage).width(800).height(500).fit("crop").url()
                    : undefined
                }
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </StackedSection>
  );
}
