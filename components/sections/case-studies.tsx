import { getLocale, getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/client";
import { CASE_STUDIES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { CaseStudyListItem } from "@/sanity/types";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import type { DetailItem } from "@/components/detail/detail-context";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";

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
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((caseStudy, index) => {
            const item: DetailItem = {
              id: `case-${caseStudy.id}`,
              kind: "case-study",
              title: caseStudy.name,
              tags: caseStudy.tags ?? [],
              detail: {
                summary: caseStudy.detailSummary,
                highlights: caseStudy.highlights.map((h) => h.text),
              },
              image: caseStudy.mainImage?.asset
                ? urlFor(caseStudy.mainImage).width(800).height(500).fit("crop").url()
                : undefined,
              problem: caseStudy.problem,
              solution: caseStudy.solution,
              result: caseStudy.result,
              problemLabel: t("problem"),
              solutionLabel: t("solution"),
              resultLabel: t("result"),
            };
            return <CaseStudyCard key={caseStudy.id} item={item} index={index} />;
          })}
        </div>
      </div>
    </StackedSection>
  );
}
