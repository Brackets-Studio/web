import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/site";

/**
 * L'intestazione delle landing verticali.
 *
 * Deliberatamente anonima: nessun link di navigazione, nessun cambio lingua,
 * nessun toggle del tema. Chi arriva qui da una ricerca locale non deve trovare
 * la porta per il resto del sito — deve trovare il numero di telefono. Ogni voce
 * di menu in più è un modo di uscire dalla pagina senza chiamare.
 *
 * Resta solo l'identificazione minima (chi siamo, da dove) perché una landing
 * senza un nome sopra è una landing di cui non ci si fida.
 */
export function VerticalHeader({ telHref }: { telHref: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="min-w-0">
          <p className="v-label truncate text-xs uppercase text-foreground">
            {siteConfig.name}
          </p>
          <p className="truncate text-xs text-foreground-muted">{siteConfig.areaServed}</p>
        </div>

        <a
          href={telHref}
          className="v-label inline-flex shrink-0 items-center gap-2 text-sm text-foreground transition-colors hover:text-brand"
        >
          <Phone className="size-4" aria-hidden />
          <span className="hidden sm:inline">{siteConfig.phone}</span>
          <span className="sm:hidden">Chiama</span>
        </a>
      </div>
    </header>
  );
}
