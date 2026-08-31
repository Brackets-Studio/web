import { ImageResponse } from "next/og";
import { getVertical } from "@/sanity/verticals";
import { resolvePreset } from "@/lib/verticals/presets";
import { siteConfig } from "@/lib/site";

export const alt = "Bracket Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image per landing verticale, zero dipendenze (`next/og`). Usa i colori
 * del preset risolto della nicchia, così l'anteprima condivisa su
 * WhatsApp/social riflette il tema della pagina invece della OG generica
 * dello studio.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; vertical: string }>;
}) {
  const { locale, vertical: slug } = await params;
  const vertical = locale === "it" ? await getVertical(slug) : null;
  const preset = resolvePreset(vertical?.theme?.preset);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: preset.tokens.background,
          color: preset.tokens.foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: preset.tokens.foregroundMuted,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {vertical?.hero.eyebrow && (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: preset.tokens.brand,
              }}
            >
              {vertical.hero.eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 980,
            }}
          >
            {vertical?.hero.title ?? siteConfig.name}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
