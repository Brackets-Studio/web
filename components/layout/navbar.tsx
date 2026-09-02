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
import { ChevronDown } from "lucide-react";
import LocaleSwitcher from "../utils/localeswitcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";
import { isCurrent } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavLink = { href: string; key: string };
type NavEntry = NavLink | { key: string; items: NavLink[] };

/**
 * Quattro voci, e quattro devono restare.
 *
 * La barra collassa a max-w-2xl appena si scorre: ogni voce in più la stringe
 * fino a spezzarla, e ogni nuova pagina (le landing verticali, le pagine per
 * servizio, /lab) chiederebbe il suo posto. Quindi la barra non cresce mai:
 * cresce quello che sta dentro i gruppi. Una pagina nuova entra come voce di
 * un menu, non come voce della navbar.
 */
const NAV: NavEntry[] = [
  {
    key: "services",
    items: [
      { href: "/#servizi", key: "whatWeDo" },
      { href: "/servizi", key: "servicesIndex" },
      { href: "/pricing", key: "pricing" },
    ],
  },
  { href: "/work", key: "caseStudies" },
  {
    key: "resources",
    items: [
      { href: "/come-lavoriamo", key: "howWeWork" },
      { href: "/analisi", key: "analyze" },
      { href: "/blog", key: "blog" },
      { href: "/lab", key: "lab" },
    ],
  },
  { href: "/team", key: "about" },
];

function isGroup(entry: NavEntry): entry is { key: string; items: NavLink[] } {
  return "items" in entry;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const MotionLink = motion.create(Link);
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
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (bracketRef.current) setBracketWidth(bracketRef.current.scrollWidth);
  }, []);

  /*
   * Quello che ci si aspetta da un pannello aperto sopra la pagina, e che qui
   * mancava: Esc lo chiude, un tocco fuori lo chiude, e la pagina sotto non
   * scorre mentre è aperto (era la cosa più fastidiosa: si scrollava l'articolo
   * dietro il menu). Chiudendo, il focus torna sul bottone che l'ha aperto —
   * altrimenti chi naviga da tastiera riparte dall'inizio del documento.
   *
   * Il listener sta sul document e non sul pannello: un `onBlur` non basta,
   * perché il tocco può cadere su un'area senza elementi focusabili.
   */
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    }

    function onPointerDown(event: PointerEvent) {
      if (headerRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

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
          ref={headerRef}
          className={`w-full border bg-background transition-[max-width,margin-top,border-radius,border-color,background-color,box-shadow] duration-500 ${
            scrolled
              ? "max-w-2xl mt-4 rounded-4xl border-border bg-background-elevated shadow-md backdrop-blur-md"
              : "max-w-full mt-0 rounded-none border-x-transparent border-t-transparent border-b-border backdrop-blur-none"
          }`}
          style={{ transitionTimingFunction: EASE_OUT_CSS }}
        >
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 pr-4">
          <Link
            href="/"
            aria-label="Bracket Studio"
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
                  bracket
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

          <nav className="col-start-2 hidden items-center gap-5 justify-self-center md:flex">
            {NAV.map((entry) =>
              isGroup(entry) ? (
                <DropdownMenu key={entry.key}>
                  {/* Il solo cambio di colore del testo non è un indicatore di
                      focus sufficiente: serve un contorno. `rounded-sm` +
                      `outline-offset` lo staccano dalla parola.

                      Niente `aria-current` qui: il trigger non è un link e non
                      porta da nessuna parte. Segnala solo, a colpo d'occhio, che
                      la pagina corrente sta in questo gruppo — il `current` vero
                      va sulla voce dentro il menu. */}
                  <DropdownMenuTrigger
                    className={`group flex items-center gap-1 rounded-sm text-sm transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground data-popup-open:text-foreground ${
                      entry.items.some((item) => isCurrent(pathname, item.href))
                        ? "text-foreground"
                        : "text-foreground-muted"
                    }`}
                  >
                    {t(entry.key)}
                    <ChevronDown
                      className="size-3.5 transition-transform duration-200 group-data-popup-open:rotate-180"
                      aria-hidden
                    />
                  </DropdownMenuTrigger>
                  {/* w-auto annulla il w-(--anchor-width) del componente, che
                      altrimenti stringerebbe il menu sulla larghezza della
                      parola che lo apre. */}
                  <DropdownMenuContent align="center" sideOffset={10} className="w-auto min-w-52 p-1.5">
                    {entry.items.map((item) => {
                      const current = isCurrent(pathname, item.href);
                      return (
                        <DropdownMenuItem
                          key={item.key}
                          className={`px-2.5 py-2 transition-colors hover:text-foreground ${
                            current ? "text-foreground" : "text-foreground-muted"
                          }`}
                          render={
                            <Link
                              href={item.href}
                              aria-current={current ? "page" : undefined}
                            />
                          }
                        >
                          {t(item.key)}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                (() => {
                  const current = isCurrent(pathname, entry.href);
                  return (
                    <Link
                      key={entry.key}
                      href={entry.href}
                      aria-current={current ? "page" : undefined}
                      className={`group relative text-sm transition-colors hover:text-foreground ${
                        current ? "text-foreground" : "text-foreground-muted"
                      }`}
                    >
                      {t(entry.key)}
                      {/* La sottolineatura dell'hover esisteva già: sulla pagina
                          corrente resta semplicemente ferma a scale-x-100
                          invece di comparire al passaggio del mouse. */}
                      <span
                        aria-hidden
                        className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-brand transition-transform duration-200 ease-out group-hover:scale-x-100 ${
                          current ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  );
                })()
              ),
            )}
          </nav>

          <div className="col-start-3 hidden items-center gap-3 justify-self-end md:flex">
            {/* Theme + lingua compaiono solo nella navbar espansa (non scrollata):
                quando la barra collassa a max-w-2xl non c'è spazio, quindi svaniscono. */}
            <AnimatePresence initial={false}>
              {!scrolled && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <LocaleSwitcher pathname={pathname} />
                  <ThemeToggle />
                </motion.div>
              )}
            </AnimatePresence>

            <MotionLink
              href="/#contatti"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-[100px] bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
            >
              {t("cta")}
            </MotionLink>
          </div>

          <div className="col-start-3 flex items-center gap-2 justify-self-end md:hidden">
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
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
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              {/* Da telefono niente tendine: il pannello è già un elenco, e
                  nasconderci dentro altri livelli servirebbe solo a far
                  toccare due volte. I gruppi diventano intestazioni. */}
              <nav className="flex flex-col gap-1 px-6 py-4">
                {NAV.map((entry) =>
                  isGroup(entry) ? (
                    <div key={entry.key} className="mt-3 first:mt-0">
                      <p className="py-1 font-mono text-xs tracking-wider text-foreground-muted/70 uppercase">
                        {t(entry.key)}
                      </p>
                      {entry.items.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                          /* Da telefono non c'è hover: la pagina corrente si
                             riconosce solo dal colore pieno e dal trattino. */
                          className={`block border-l-2 py-2 pl-3 text-sm transition-colors hover:text-foreground ${
                            isCurrent(pathname, item.href)
                              ? "border-brand text-foreground"
                              : "border-transparent text-foreground-muted"
                          }`}
                        >
                          {t(item.key)}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={entry.key}
                      href={entry.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isCurrent(pathname, entry.href) ? "page" : undefined}
                      className={`border-l-2 py-2 pl-3 text-sm transition-colors hover:text-foreground ${
                        isCurrent(pathname, entry.href)
                          ? "border-brand text-foreground"
                          : "border-transparent text-foreground-muted"
                      }`}
                    >
                      {t(entry.key)}
                    </Link>
                  ),
                )}
                <MotionLink
                  href="/#contatti"
                  onClick={() => setMenuOpen(false)}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 inline-flex items-center justify-center rounded-[100px] bg-brand px-4 py-2 text-sm font-medium text-brand-foreground"
                >
                  {t("cta")}
                </MotionLink>
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
