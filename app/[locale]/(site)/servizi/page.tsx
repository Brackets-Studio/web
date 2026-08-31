import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { Monogram } from "@/components/ui/monogram";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { sanityFetch } from "@/sanity/client";
import { SERVICES_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { ServiceListItem } from "@/sanity/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servizi.index" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/servizi`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/servizi`])),
    },
  };
}

export default async function ServicesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, services] = await Promise.all([
    getTranslations("servizi.index"),
    sanityFetch<ServiceListItem[]>({
      query: SERVICES_QUERY,
      params: { locale },
      tags: ["service"],
    }),
  ]);

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

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {services.map((service, index) => (
            <Reveal key={service.slug} index={index} className="h-full">
              <Link
                href={`/servizi/${service.slug}`}
                className="group flex h-full items-stretch overflow-hidden rounded-lg border border-border bg-background-elevated transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-border/40"
              >
                <div className="relative flex w-28 shrink-0 items-center justify-center overflow-hidden bg-background-elevated/60 sm:w-48">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  {service.heroImage?.asset ? (
                    <Image
                      src={urlFor(service.heroImage).width(480).height(480).url()}
                      alt=""
                      width={240}
                      height={240}
                      sizes="(min-width: 640px) 96px, 56px"
                      className="relative h-auto w-12 object-contain transition-transform duration-300 group-hover:scale-105 sm:w-20"
                    />
                  ) : (
                    <Monogram title={service.title} />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-lg font-semibold text-foreground lg:min-h-14">
                      {service.title}
                    </h2>
                    <ArrowUpRight
                      className="mt-1 size-4 shrink-0 text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </div>
                  <p className="line-clamp-3 text-sm text-foreground-muted lg:min-h-15">
                    {service.shortDescription}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </StackedSection>
  );
}
