import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { FaviconSwitcher } from "@/components/theme/favicon-switcher";
import { HtmlLangSync } from "@/components/theme/html-lang-sync";
import { Cursor } from "@/components/ui/cursor";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const OG_LOCALE: Record<string, string> = { it: "it_IT", en: "en_US" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}`])
  );

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: `%s — ${siteConfig.name}`,
    },
    description: t("description"),
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": `/${routing.defaultLocale}` },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: siteConfig.name,
      title: t("title"),
      description: t("description"),
      locale: OG_LOCALE[locale] ?? locale,
      images: [
        {
          url: "/og_image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og_image.png"],
    },
  };
}

function organizationJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: `${siteConfig.url}/${locale}`,
    logo: `${siteConfig.url}/favicon-dark.png`,
    email: siteConfig.email,
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
  };
}

function websiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: `${siteConfig.url}/${locale}`,
    inLanguage: locale,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd(locale)) }}
      />
      <ThemeProvider>
        <HtmlLangSync locale={locale} />
        <FaviconSwitcher />
        <Cursor />
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
