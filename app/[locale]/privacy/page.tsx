import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/layout/legal-page";

type LegalSection = { heading: string; body: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal.privacy");
  const sections = t.raw("sections") as LegalSection[];

  return (
    <LegalPage title={t("title")} updated={t("updated")} intro={t("intro")}>
      {sections.map((section) => (
        <div key={section.heading}>
          <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{section.body}</p>
        </div>
      ))}
    </LegalPage>
  );
}
