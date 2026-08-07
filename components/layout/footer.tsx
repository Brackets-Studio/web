'use client'

import { useTranslations } from "next-intl";
import { StackedSection } from "@/components/layout/stacked-section";
import LocaleSwitcher from "../utils/LocaleSwitcher";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "../theme/theme-toggle";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Brackets-Studio" },
  { label: "LinkedIn", href: "https://linkedin.com/company/brackets-studio" },
  { label: "Email", href: "mailto:info@bracketstudio.it" },
];

export function Footer() {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <StackedSection as="footer" last className='mt-20'>
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pt-16">
        {/* Top row: tagline + controls / social links */}
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4">
            <p className="max-w-xs text-sm text-foreground-muted">{t("tagline")}</p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LocaleSwitcher pathname={pathname} />
            </div>
          </div>

          <nav className="flex flex-col gap-2 font-mono text-sm sm:items-end">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-foreground-muted transition-colors hover:text-brand"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Big logo — SVG auto-fits the wordmark to the full container width,
            so it's always as large as max-w-6xl allows and scales fluidly. */}
        <svg
          viewBox="0 0 680 84"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Bracket Studio"
          className="block w-full text-foreground select-none"
        >
          <text
            x="340"
            y="68"
            textAnchor="middle"
            textLength="680"
            lengthAdjust="spacingAndGlyphs"
            fontSize="92"
            fill="currentColor"
            style={{ fontFamily: "var(--font-bricolage)", fontWeight: 700 }}
          >
            Bracket Studio
          </text>
        </svg>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-start justify-between gap-4 text-xs text-foreground-muted sm:flex-row sm:items-center">
          <p>© {year} Bracket Studio. {t("rights")}</p>
          <nav className="flex items-center gap-4 font-mono">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              {t("legal.privacy")}
            </Link>
            <Link href="/cookie-policy" className="transition-colors hover:text-foreground">
              {t("legal.cookiePolicy")}
            </Link>
          </nav>
        </div>
      </div>
    </StackedSection>
  );
}
