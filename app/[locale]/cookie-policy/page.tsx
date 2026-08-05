import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/layout/legal-page";

type CookieItem = { name: string; type: string; purpose: string; duration: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.cookiePolicy" });
  return { title: t("title") };
}

export default async function CookiePolicyPage() {
  const t = await getTranslations("legal.cookiePolicy");
  const items = t.raw("items") as CookieItem[];
  const headers = t.raw("tableHeaders") as Record<keyof CookieItem, string>;

  return (
    <LegalPage title={t("title")} updated={t("updated")} intro={t("intro")}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left font-mono text-xs uppercase tracking-wide text-foreground-muted">
              <th className="px-4 py-3 font-medium">{headers.name}</th>
              <th className="px-4 py-3 font-medium">{headers.type}</th>
              <th className="px-4 py-3 font-medium">{headers.purpose}</th>
              <th className="px-4 py-3 font-medium">{headers.duration}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{item.name}</td>
                <td className="px-4 py-3 text-foreground-muted">{item.type}</td>
                <td className="px-4 py-3 text-foreground-muted">{item.purpose}</td>
                <td className="px-4 py-3 text-foreground-muted">{item.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm leading-relaxed text-foreground-muted">{t("outro")}</p>
    </LegalPage>
  );
}
