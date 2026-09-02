import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Il marquee CSS-only (`.marquee-track`, vedi `app/globals.css`) scorre di
 * `translateX(-50%)`: senza contenuto, quel 50% è la larghezza di UNA sola
 * passata. Se ci sono pochi loghi la passata è più stretta del contenitore,
 * e lo scroll arriva in fondo mostrando il vuoto invece di ripartire senza
 * cuciture. Ripetendo gli elementi fino a una lunghezza minima garantiamo che
 * ogni passata da sola riempia sempre il contenitore, qualunque sia il numero
 * di loghi reali.
 */
export function repeatToMinLength<T>(items: readonly T[], min: number): T[] {
  if (items.length === 0) return [];
  const times = Math.ceil(min / items.length);
  return Array.from({ length: times }, () => items).flat();
}

/**
 * La voce di navigazione `href` corrisponde alla pagina che si sta guardando?
 *
 * `pathname` deve arrivare da `usePathname` di `@/i18n/navigation`, che lo
 * restituisce già SENZA il prefisso di lingua: confrontarlo con `/work` funziona
 * sia su `/it/work` sia su `/en/work`. Con quello di `next/navigation` non
 * combacerebbe mai.
 *
 * Due regole:
 * - le ancore (`/#servizi`) non identificano una pagina, quindi non sono mai
 *   "current": marcarle direbbe a uno screen reader che sei da una parte in cui
 *   non sei;
 * - il confronto è per prefisso di segmento, così da `/work/smartables` resta
 *   attiva la voce "Lavori". `startsWith` da solo non basterebbe — `/wo`
 *   matcherebbe `/work` — ed è il motivo della barra finale.
 */
export function isCurrent(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}