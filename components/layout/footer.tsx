'use client'

import { useTranslations } from "next-intl";
import { StackedSection } from "@/components/layout/stacked-section";
import { BracketMark } from "@/components/ui/bracket-mark";
import LocaleSwitcher from "../utils/LocaleSwitcher";
import { usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "../theme/theme-toggle";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Brackets-Studio" },
  { label: "LinkedIn", href: "https://linkedin.com/company/brackets-studio" },
  { label: "Email", href: "mailto:hello@bracketstudio.it" },
];

export function Footer() {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <StackedSection id="contatti" as="footer" last>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2">
          <BracketMark className="mt-0.5 text-lg leading-none text-foreground" />
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-mono text-sm font-medium">Bracket Studio</p>
              <p className="mt-1 text-sm text-foreground-muted">{t("tagline")}</p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ThemeToggle />
              <LocaleSwitcher pathname={pathname} />
            </div>
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


      <div className="border-t border-border px-6 py-6">
        <p className="mx-auto max-w-6xl text-xs text-foreground-muted">
          © {year} Bracket Studio. {t("rights")}
        </p>
      </div>
    </StackedSection>
  );
}
