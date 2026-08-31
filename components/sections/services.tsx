import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ServicesAccordion } from "@/components/sections/services-accordion";
import { Link } from "@/i18n/navigation";
import { sanityFetch } from "@/sanity/client";
import { SERVICES_QUERY } from "@/sanity/queries";
import type { ServiceListItem } from "@/sanity/types";

/**
 * Chrome (eyebrow/titolo/CTA) da next-intl, contenuto dei singoli servizi da
 * Sanity: un solo posto (`service`) alimenta sia questa sezione sia
 * `/servizi/<slug>`.
 */
export async function Services({ locale }: { locale: string }) {
  const [t, services] = await Promise.all([
    getTranslations("services"),
    sanityFetch<ServiceListItem[]>({
      query: SERVICES_QUERY,
      params: { locale },
      tags: ["service"],
    }),
  ]);

  if (services.length === 0) return null;

  return (
    <StackedSection id="servizi">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <ServicesAccordion items={services} />

        <div className="mt-12 flex justify-center">
          <Link
            href="/#contatti"
            className="inline-flex items-center rounded-pill bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </StackedSection>
  );
}
