import type { Metadata } from "next";
import type { SVGProps } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Globe, MapPin } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import CtaSection from "@/components/utils/cta-section";

// lucide (questa versione) non espone icone brand: SVG inline per GitHub/LinkedIn.
type IconProps = SVGProps<SVGSVGElement>;

function GithubIcon({ className, ...props }: IconProps) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon({ className, ...props }: IconProps) {
  return (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const LINKS = [
  { key: "github", href: "https://github.com/namecoder1", Icon: GithubIcon },
  { key: "linkedin", href: "https://www.linkedin.com/in/tobia-bartolomei/", Icon: LinkedinIcon },
  { key: "website", href: "https://tob.codes", Icon: Globe },
] as const;

type Principle = { title: string; description: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/team`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/team`])),
    },
  };
}

export default async function TeamPage() {
  const t = await getTranslations("about");
  const body = t.raw("body") as string[];
  const principles = t.raw("principles") as Principle[];

  return (
    <>
      {/* Intro: foto + presentazione */}
      <StackedSection>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="relative mx-auto aspect-4/5 w-full max-w-sm overflow-hidden rounded-2xl border border-border shadow-md">
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <Image
              src="/assets/profile.png"
              alt="Tobia Bartolomei"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 35vw, 90vw"
            />
          </Reveal>

          <Reveal index={1}>
            <p className="mb-6 w-fit uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl">
              {t("greeting")}
            </h1>
            <p className="mt-2 font-mono text-sm text-brand">{t("role")}</p>

            <div className="mt-6 max-w-xl space-y-4 text-foreground-muted">
              {body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-foreground-muted">
              <MapPin className="size-4 text-brand" aria-hidden />
              {t("location")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {LINKS.map(({ key, href, Icon }) => (
                <Link
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex bg-background-elevated items-center gap-2 rounded-[100px] border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand"
                >
                  <Icon className="size-4 text-brand" />
                  {t(`links.${key}`)}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </StackedSection>

      {/* Principi */}
      <StackedSection className="bg-surface-alt">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
              {t("principlesTitle")}
            </h2>
            <p className="mt-3 text-foreground-muted">{t("principlesSubtitle")}</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {principles.map((principle, index) => (
              <Reveal
                key={principle.title}
                index={index}
                className="flex flex-col rounded-lg border border-border bg-background-elevated p-6 shadow-sm"
              >
                <span className="font-mono text-sm text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">{principle.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </StackedSection>

      <StackedSection>
        <div className="mx-auto max-w-6xl px-6 py-20">
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
