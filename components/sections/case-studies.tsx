import { getLocale, getTranslations } from "next-intl/server";
import { sanityFetch } from "@/sanity/client";
import { CASE_STUDIES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { CaseStudyListItem } from "@/sanity/types";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import { StackedSection } from "@/components/layout/stacked-section";
import { SectionHeader } from "@/components/ui/section-header";
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

  // La sezione si renderizza sempre: la CTA secondaria dell'hero punta a
  // "#lavori", quindi l'ancora deve esistere nel DOM anche a vetrina vuota.
  return (
    <StackedSection id="lavori" className="bg-[#eeece6] dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        {caseStudies.length > 0 ? (
          <>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {caseStudies.slice(0, 3).map((caseStudy, index) => (
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
                className="group inline-flex items-center gap-2 rounded-pill border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60"
              >
                {t("backToWork")}
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Reveal>
          </>
        ) : (
          <Reveal className="mt-12 rounded-lg border border-dashed border-border bg-background-elevated/60 px-6 py-12 text-center">
            <p className="font-medium text-foreground">{t("empty.title")}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
              {t("empty.body")}
            </p>
            <Link
              href="/#contatti"
              className="mt-6 inline-flex items-center rounded-pill bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("cta.button")}
            </Link>
          </Reveal>
        )}
      </div>
    </StackedSection>
  );
}
