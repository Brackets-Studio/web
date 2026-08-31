import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check } from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Monogram } from "@/components/ui/monogram";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { sanityFetch, client } from "@/sanity/client";
import { SERVICE_BY_SLUG_QUERY, SERVICE_SLUGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { ServiceDetail } from "@/sanity/types";

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(SERVICE_SLUGS_QUERY);
  return routing.locales.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

async function getService(locale: string, slug: string) {
  return sanityFetch<ServiceDetail | null>({
    query: SERVICE_BY_SLUG_QUERY,
    params: { locale, slug },
    tags: ["service", "pricingSettings"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getService(locale, slug);
  if (!service) return {};

  const title = service.seo?.title || service.title;
  const description = service.seo?.description || service.shortDescription;
  const image = service.seo?.image ?? service.heroImage;
  const imageUrl = image?.asset ? urlFor(image).width(1200).height(630).fit("crop").url() : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/servizi/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/servizi/${slug}`])),
    },
    robots: service.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
    },
  };
}

const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-4 text-base leading-relaxed text-foreground-muted">{children}</p>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-brand underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [service, t] = await Promise.all([
    getService(locale, slug),
    getTranslations("servizi.detail"),
  ]);

  if (!service) notFound();

  const imageUrl = service.heroImage?.asset
    ? urlFor(service.heroImage).width(640).height(640).url()
    : undefined;

  const priceCard = service.price && (
    <div className="rounded-lg border border-border bg-background-elevated p-6">
      <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
        {t("priceFrom")}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">
        €{service.price.basePrice.toLocaleString(locale)}
      </p>
      <p className="mt-1 text-sm text-foreground-muted">
        {t("timelineLabel")} {t("weeks", { count: service.price.baseTimelineWeeks })}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-[100px] bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {t("ctaQuote")}
        </Link>
        <Link
          href="/#contatti"
          className="inline-flex items-center justify-center rounded-[100px] border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand"
        >
          {t("ctaContact")}
        </Link>
      </div>
    </div>
  );

  return (
    <StackedSection>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link
          href="/servizi"
          className="inline-flex items-center gap-2 font-mono text-sm text-foreground-muted transition-colors hover:text-brand"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </Link>

        <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            {service.eyebrow && (
              <p className="font-mono text-xs uppercase tracking-wide text-brand">
                {service.eyebrow}
              </p>
            )}
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl">
              {service.title}
            </h1>
            <p className="mt-4 text-lg text-foreground-muted">{service.shortDescription}</p>

            {service.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <Badge variant='outline' key={tag.text}>{tag.text}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="relative mx-auto flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background-elevated/60 sm:size-56">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={service.heroImage?.alt ?? service.title}
                width={320}
                height={320}
                priority
                sizes="224px"
                className="relative h-auto w-28 object-contain sm:w-36"
              />
            ) : (
              <Monogram title={service.title} />
            )}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            {service.detail.summary && (
              <p className="text-base leading-relaxed text-foreground">
                {service.detail.summary}
              </p>
            )}

            {service.detail.highlights.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                  {t("highlightsTitle")}
                </p>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {service.detail.highlights.map((highlight) => (
                    <li
                      key={highlight.text}
                      className="flex items-start gap-3 rounded-lg border border-border bg-background-elevated/40 p-3 text-sm text-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                      {highlight.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.body && service.body.length > 0 && (
              <div className="mt-10">
                <PortableText value={service.body} components={bodyComponents} />
              </div>
            )}

            {priceCard && <div className="mt-10 lg:hidden">{priceCard}</div>}
          </div>

          {priceCard && (
            <div className="hidden lg:block">
              <div className="sticky top-24">{priceCard}</div>
            </div>
          )}
        </div>
      </div>
    </StackedSection>
  );
}
