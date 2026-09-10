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
    <StackedSection id="lavori" className="bg-background-elevated border border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        {/* Peso forte: insieme al modulo di contatto è una delle due sezioni
            che devono fermare lo scorrimento. Vedi i tre registri in
            `components/ui/section-header.tsx`. */}
        <SectionHeader
          weight="strong"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        {caseStudies.length > 0 ? (
          <>
            {/* Uno in evidenza a tutta larghezza, gli altri due sotto in due
                colonne. È l'unico punto della home in cui la griglia si rompe,
                ed è deliberato: sei sezioni di fila usavano card tutte uguali e
                l'occhio non aveva un posto dove fermarsi. L'irregolarità tocca
                ai lavori fatti perché sono la cosa che deve convincere.

                L'immagine del primo è richiesta più grande (1600px contro 800):
                a tutta larghezza quella da 800 si vedrebbe sgranata. */}
            <div className="mt-12 flex flex-col gap-6">
              {caseStudies.slice(0, 1).map((caseStudy) => (
                <CaseStudyCard
                  key={caseStudy.id}
                  variant="featured"
                  slug={caseStudy.slug}
                  title={caseStudy.name}
                  tags={caseStudy.tags ?? []}
                  result={caseStudy.result}
                  resultLabel={t("result")}
                  viewLabel={t("viewCaseStudy")}
                  image={
                    caseStudy.mainImage?.asset
                      ? urlFor(caseStudy.mainImage).width(1600).height(1000).fit("crop").url()
                      : undefined
                  }
                  index={0}
                />
              ))}

              {caseStudies.length > 1 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {caseStudies.slice(1, 3).map((caseStudy, index) => (
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
                      index={index + 1}
                    />
                  ))}
                </div>
              )}
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
