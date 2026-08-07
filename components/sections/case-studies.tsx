import { getLocale, getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/client";
import { CASE_STUDIES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { CaseStudyListItem } from "@/sanity/types";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

export async function CaseStudies() {
  const locale = await getLocale();
  const t = await getTranslations("caseStudies");

  const caseStudies = await sanityFetch<CaseStudyListItem[]>({
    query: CASE_STUDIES_QUERY,
    params: { locale },
    tags: ["caseStudy"],
  });

  if (caseStudies.length === 0) return null;

  return (
    <StackedSection id="case-study" className="bg-neutral-200/20 dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="mb-6 w-fit tracking-wider uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <Reveal className="mt-12 flex justify-center">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 rounded-[100px] border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand"
          >
            {t("backToWork")}
            <ArrowUpRight
              size={16}
              className="text-brand transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </StackedSection>
  );
}
