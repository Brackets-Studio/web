import { VerticalHeader } from "@/components/verticals/vertical-header";
import { VerticalFooter } from "@/components/verticals/vertical-footer";
import { StickyCta } from "@/components/verticals/sticky-cta";
import { verticalFontClasses } from "@/lib/verticals/fonts";
import { presetStyle, resolvePreset } from "@/lib/verticals/presets";
import { siteConfig } from "@/lib/site";
import { getVertical } from "@/sanity/verticals";
import { HERO_ID, telHref } from "@/lib/verticals/shared";

/**
 * Il guscio di una landing verticale.
 *
 * Sta a livello `[vertical]` e non `(verticali)` perché deve conoscere lo slug:
 * il tema arriva dal documento Sanity. La query è la stessa della pagina, ma
 * `getVertical` è avvolta in `cache()`, quindi parte una volta sola.
 *
 * Il tema si applica ridefinendo le custom property su un wrapper. Siccome i
 * colori Tailwind del progetto sono dichiarati in `@theme inline` come
 * `var(--background)` e simili, l'intero sottoalbero cambia palette senza che un
 * solo componente sappia dell'esistenza dei preset. Ridefinire i token qui vuol
 * dire anche che la landing IGNORA il tema chiaro/scuro del sito: è voluto —
 * senza navbar non c'è più un toggle, e una pagina di vendita deve essere quella
 * che hai disegnato, non quella che decide il sistema operativo del visitatore.
 */
export default async function VerticalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; vertical: string }>;
}) {
  const { locale, vertical: slug } = await params;
  const vertical = locale === "it" ? await getVertical(slug) : null;

  /*
   * Il 404 lo decide la pagina, non questo layout — e non è un dettaglio.
   * `notFound()` chiamato da un layout scavalca il `not-found.tsx` di `[locale]`
   * e finisce su quello globale, senza navbar né footer. Siccome `[vertical]`
   * cattura OGNI path a un segmento sotto `/it/`, vorrebbe dire che qualsiasi
   * errore di battitura porta a una pagina senza uscite. Qui si lasciano passare
   * i figli nudi: la pagina chiama `notFound()` e il 404 giusto lo intercetta.
   */
  if (!vertical) return <>{children}</>;

  const preset = resolvePreset(vertical.theme?.preset);
  const tel = telHref();

  return (
    <div
      data-vertical-theme={preset.id}
      className={`${verticalFontClasses} flex flex-1 flex-col`}
      style={presetStyle(preset, vertical.theme?.accentOverride)}
    >
      <VerticalHeader telHref={tel} />
      <main className="flex-1">{children}</main>
      <VerticalFooter telHref={tel} />
      <StickyCta
        telHref={tel}
        whatsappHref={siteConfig.whatsapp}
        callLabel={vertical.hero.ctaLabel}
        whatsappLabel={vertical.hero.ctaWhatsappLabel}
        watchId={HERO_ID}
      />
    </div>
  );
}
