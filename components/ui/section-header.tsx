import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

/**
 * Intestazione condivisa da tutte le sezioni.
 *
 * Prima ogni sezione ridichiarava la propria pill eyebrow inline, e le sei
 * copie avevano divergito (tracking, ombre, allineamento): questo componente
 * è l'unica definizione, così l'occhio riconosce lo stesso pattern scorrendo.
 *
 * L'eyebrow è un <p> puramente decorativo dal punto di vista semantico: la
 * gerarchia del documento la porta l'<h2>.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * I TRE PESI
 *
 * Il problema che risolvono: con un solo peso, ogni sezione della home aveva
 * la stessa autorità visiva. I case study — la cosa che deve fermare lo
 * scorrimento — pesavano quanto le FAQ, e il marquee dei loghi (una striscia
 * decorativa) aveva titolo e sottotitolo come una sezione vera. Scorrendo, la
 * pagina non diceva mai "questa conta più di quella".
 *
 *   strong  Le due o tre sezioni che devono fermare lo scorrimento.
 *           Occhiello, titolo di una taglia sopra, sottotitolo più grande.
 *   medium  Il registro normale. È il default: chi non sceglie sta qui.
 *   light   Le strisce di servizio (loghi, newsletter). Niente occhiello,
 *           niente titolone: un'etichetta e via. Restano un <h2> per la
 *           gerarchia del documento, ma tipograficamente non urlano.
 *
 * La SPAZIATURA verticale resta nel TSX di ogni sezione (`py-28` / `py-20` /
 * `py-12`, in ordine di peso) e non qui: `SectionHeader` non conosce il
 * contenitore in cui sta, e su alcune pagine la stessa intestazione vive
 * dentro padding diversi.
 */
type Weight = "strong" | "medium" | "light";

const TITLE: Record<Weight, string> = {
  strong: "max-w-3xl text-4xl sm:text-5xl",
  medium: "max-w-2xl text-3xl sm:text-4xl",
  light: "max-w-2xl text-base sm:text-lg",
};

const SUBTITLE: Record<Weight, string> = {
  strong: "max-w-2xl text-lg",
  medium: "max-w-xl",
  light: "max-w-xl text-sm",
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "start",
  weight = "medium",
  className,
  children,
}: {
  /** Ignorato con `weight="light"`: una striscia di servizio non ha occhiello. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  weight?: Weight;
  className?: string;
  children?: ReactNode;
}) {
  const centered = align === "center";

  return (
    <Reveal
      className={cn(
        "flex flex-col",
        centered ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && weight !== "light" && (
        <p className="mb-5 w-fit rounded-full border border-accent-brand/25 bg-accent-brand/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-bold tracking-[-0.02em] text-balance text-foreground",
          TITLE[weight],
          // Nel registro leggero il titolo è un'etichetta, non un titolo:
          // mono maiuscolo, come le altre etichette del sito.
          weight === "light" &&
            "font-mono font-normal uppercase tracking-wider text-foreground-muted",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-foreground-muted",
            SUBTITLE[weight],
            weight === "light" && "mt-3",
            centered && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
      {children}
    </Reveal>
  );
}
