"use client";

import { useEffect, useRef, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "../utils/LocaleSwitcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";


const NAV_ITEMS = [
  { href: "#servizi", key: "services" as const },
  { href: "#case-study", key: "caseStudies" as const },
  { href: "#contatti", key: "contact" as const },
];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
const SCROLL_THRESHOLD = 16;
const BRACKET_COLLAPSE_RANGE = [0, 72];
// Once "brackets" has wiped away, fade in the "studio" suffix over the tail
// of the same scroll range, so "{}" settles before "studio" appears.
const STUDIO_FADE_RANGE = [48, 72];

// Monospace, code-flavored weight for the wordmark, so "{brackets}" reads
// like an actual object literal.
const markFont = JetBrains_Mono({ subsets: ["latin"], weight: "700" });

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > SCROLL_THRESHOLD);
  });
  const bracketRef = useRef<HTMLSpanElement>(null);
  const [bracketWidth, setBracketWidth] = useState<number | null>(null);

  useEffect(() => {
    if (bracketRef.current) setBracketWidth(bracketRef.current.scrollWidth);
  }, []);

  const bracketContainerWidth = useTransform(
    scrollY,
    BRACKET_COLLAPSE_RANGE,
    [bracketWidth ?? 0, 0],
  );
  const studioOpacity = useTransform(scrollY, STUDIO_FADE_RANGE, [0, 1]);

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-60 flex justify-center transition-[padding] duration-500 ${
          scrolled ? "px-6" : "px-0"
        }`}
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      >
        <header
          className={`w-full border bg-background transition-[max-width,margin-top,border-radius,border-color,background-color,box-shadow] duration-500 ${
            scrolled
              ? "max-w-2xl mt-4 rounded-4xl border-border bg-background/80 shadow-md backdrop-blur-md"
              : "max-w-full mt-0 rounded-none border-x-transparent border-t-transparent border-b-border backdrop-blur-none"
          }`}
          style={{ transitionTimingFunction: EASE_OUT_CSS }}
        >
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
          <Link
            href="/"
            aria-label="Brackets Studio"
            className="flex items-center gap-2"
          >
            <span
              className={`${markFont.className} flex items-center whitespace-nowrap text-lg leading-none text-foreground`}
            >
              <span>{"{"}</span>
              <motion.span
                style={bracketWidth !== null ? { width: bracketContainerWidth } : undefined}
                className="inline-block overflow-hidden whitespace-nowrap"
              >
                <span ref={bracketRef} className="inline-block">
                  brackets
                </span>
              </motion.span>
              <span>{"}"}</span>
            </span>
            <motion.p
              style={{ opacity: studioOpacity }}
              className={`font-mono tracking-tighter ${scrolled ? "block" : "hidden"}`}
            >
              studio
            </motion.p>
          </Link>

          <nav className="col-start-2 hidden items-center gap-8 justify-self-center md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="group relative text-sm text-foreground-muted transition-colors hover:text-foreground"
              >
                {t(item.key)}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-200 ease-out group-hover:scale-x-100"
                />
              </a>
            ))}
          </nav>

          <div className="col-start-3 hidden items-center gap-3 justify-self-end md:flex">
            
            <motion.a
              href="#contatti"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-[100px] bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
            >
              {t("cta")}
            </motion.a>
          </div>

          <div className="col-start-3 flex items-center gap-2 justify-self-end md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground-muted transition-colors hover:border-brand hover:text-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {menuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <nav className="flex flex-col gap-1 px-6 py-4">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
                  >
                    {t(item.key)}
                  </a>
                ))}
                <motion.a
                  href="#contatti"
                  onClick={() => setMenuOpen(false)}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 inline-flex items-center justify-center rounded-[100px] bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
                >
                  {t("cta")}
                </motion.a>
                <div className="mt-4">
                  <LocaleSwitcher pathname={pathname} />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        </header>
      </div>
      <div className="h-16" aria-hidden />
    </>
  );
}
