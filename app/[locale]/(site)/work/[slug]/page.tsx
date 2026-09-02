import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Monogram } from "@/components/ui/monogram";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { sanityFetch, client } from "@/sanity/client";
import { CASE_STUDY_BY_SLUG_QUERY, CASE_STUDY_SLUGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { CaseStudyDetail } from "@/sanity/types";
import { siteConfig } from "@/lib/site";
import CtaSection from "@/components/utils/cta-section";

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(CASE_STUDY_SLUGS_QUERY);
  return routing.locales.flatMap((locale) =>
    slugs.map(({ slug }) => ({ locale, slug }))
  );
}

async function getCaseStudy(locale: string, slug: string) {
  return sanityFetch<CaseStudyDetail | null>({
    query: CASE_STUDY_BY_SLUG_QUERY,
    params: { locale, slug },
    tags: ["caseStudy"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const caseStudy = await getCaseStudy(locale, slug);
  if (!caseStudy) return {};

  const title = caseStudy.seo?.title || caseStudy.name;
  const description = caseStudy.seo?.description || caseStudy.excerpt;
  const image = caseStudy.seo?.image ?? caseStudy.mainImage;
  const imageUrl = image?.asset ? urlFor(image).width(1200).height(630).fit("crop").url() : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/work/${slug}`])),
    },
    robots: caseStudy.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function caseStudyJsonLd(locale: string, slug: string, caseStudy: CaseStudyDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseStudy.name,
    description: caseStudy.excerpt,
    url: `${siteConfig.url}/${locale}/work/${slug}`,
    datePublished: caseStudy.publishedAt ?? undefined,
    dateModified: caseStudy.updatedAt,
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    image: caseStudy.mainImage?.asset ? urlFor(caseStudy.mainImage).width(1200).height(630).fit("crop").url() : undefined,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [caseStudy, t] = await Promise.all([
    getCaseStudy(locale, slug),
    getTranslations("caseStudies"),
  ]);

  if (!caseStudy) notFound();

  const imageUrl = caseStudy.mainImage?.asset
    ? urlFor(caseStudy.mainImage).width(1600).height(1000).fit("crop").url()
    : undefined;

  const storyBlocks = [
    { label: t("problem"), text: caseStudy.problem },
    { label: t("solution"), text: caseStudy.solution },
    { label: t("result"), text: caseStudy.result },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd(locale, slug, caseStudy)) }}
      />
      <div className="mx-auto max-w-6xl w-full pt-8">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={caseStudy.mainImage?.alt ?? caseStudy.name}
            width={1600}
            height={1000}
            priority
            sizes="(min-width: 1280px) 72rem, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 3rem)"
            className="h-auto w-full"
          />
        ) : (
          <div className="relative h-[40vh] w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem]">
            <Monogram title={caseStudy.name} />
          </div>
        )}
      </div>

      <StackedSection className="rounded-t-none!">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 font-mono text-sm text-foreground-muted transition-colors hover:text-brand"
          >
            <ArrowLeft size={16} />
            {t("backToWork")}
          </Link>

          <div className="flex flex-col gap-8 border-b border-border pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl">
                {caseStudy.name}
              </h1>
              <p className="mt-4 text-lg text-foreground-muted">{caseStudy.excerpt}</p>
            </div>

            {caseStudy.externalLink && (
              <a
                href={caseStudy.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-2 self-start rounded-[100px] border border-border bg-background-elevated px-5 py-2.5 font-mono text-sm text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                {t("visitSite")}
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            )}
          </div>

          {caseStudy.metrics.length > 0 && (
            <dl
              className={`mt-10 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-background-elevated sm:divide-x sm:divide-y-0 ${
                caseStudy.metrics.length === 1
                  ? ""
                  : caseStudy.metrics.length === 2
                    ? "sm:grid-cols-2"
                    : caseStudy.metrics.length === 3
                      ? "sm:grid-cols-3"
                      : "sm:grid-cols-4"
              }`}
            >
              {caseStudy.metrics.map((metric) => (
                <div key={`${metric.label}-${metric.value}`} className="p-6">
                  <dt className="font-mono text-3xl font-bold text-brand">{metric.value}</dt>
                  <dd className="mt-1 text-sm text-foreground-muted">{metric.label}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <ol className="flex flex-col gap-8">
                {storyBlocks.map((block, i) => (
                  <li key={block.label} className="flex gap-5">
                    <span
                      aria-hidden
                      className="font-mono text-sm text-foreground-muted/60 tabular-nums"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 border-l border-border pl-5">
                      <p className="font-mono text-xs uppercase tracking-wide text-brand">
                        {block.label}
                      </p>
                      <p className="mt-2 text-base leading-relaxed text-foreground">{block.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-12">
                <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                  {t("overview")}
                </p>
                <p className="mt-3 text-base leading-relaxed text-foreground-muted">
                  {caseStudy.detailSummary}
                </p>
              </div>

              {caseStudy.highlights.length > 0 && (
                <div className="mt-12">
                  <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                    {t("highlights")}
                  </p>
                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {caseStudy.highlights.map((highlight) => (
                      <li
                        key={highlight.text}
                        className="flex items-start gap-3 rounded-lg border border-border bg-background-elevated p-4 text-sm text-foreground"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                        />
                        {highlight.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {caseStudy.retrospective && (
                <div className="mt-12 rounded-lg border border-brand/30 bg-brand-subtle/20 p-6">
                  <p className="font-mono text-xs uppercase tracking-wide text-brand">
                    {t("retrospective")}
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-foreground">
                    {caseStudy.retrospective}
                  </p>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-lg border border-border bg-background-elevated py-4">
                <div className="px-6 border-b border-border pb-4">
                  <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                    {t("details")}
                  </p>
                </div>

                <div className="px-4">
                  {caseStudy.publishedAt && (
                    <div className="mt-4">
                      <p className="text-xs text-foreground-muted">{t("published")}</p>
                      <time dateTime={caseStudy.publishedAt} className="text-sm text-foreground">
                        {new Date(caseStudy.publishedAt).toLocaleDateString(locale, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {caseStudy.tags.map((tag) => (
                      <Badge variant='outline' key={tag}>{tag}</Badge>
                    ))}
                  </div>

                  {caseStudy.externalLink && (
                    <a
                      href={caseStudy.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[100px] bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {t("visitSite")}
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <CtaSection
            textSettings={{
              eyebrow: t("cta.eyebrow"),
              title: t("cta.title"),
              text: t("cta.text"),
              button: t("cta.button"),
              buttonSecondary: t("cta.buttonSecondary")
            }}
          />
        </div>
      </StackedSection>
    </>
  );
}
