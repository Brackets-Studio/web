'use client'

import { routing } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe } from "lucide-react";
import { Link } from "@/i18n/navigation";

function LocaleSwitcher({ pathname }: { pathname: string }) {
  const t = useTranslations("nav");
  const activeLocale = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1.5 font-mono text-xs uppercase text-foreground-muted outline-none transition-colors hover:text-foreground data-popup-open:text-foreground"
        aria-label={t("language")}
      >
        <Globe className="size-3.5" strokeWidth={1.75} />
        {activeLocale}
        <ChevronDown className="size-3 opacity-60" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            render={
              <Link href={pathname} locale={locale} data-active={locale === activeLocale} />
            }
            className="justify-between font-mono text-xs"
          >
            <span className="uppercase">{locale}</span>
            <span className="text-foreground-muted group-focus/dropdown-menu-item:text-inherit">
              {t(`locales.${locale}`)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LocaleSwitcher