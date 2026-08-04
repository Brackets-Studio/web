import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Bracket Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", fontSize: 64, color: "#00e5c7" }}>
          {"{ }"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 56, color: "#e5e7eb", fontWeight: 600, letterSpacing: -2 }}>
            Bracket Studio
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#a3a3a3", maxWidth: 900 }}>
            {t("description")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
