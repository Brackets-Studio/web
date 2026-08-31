import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

/**
 * Intestazione condivisa da tutte le sezioni della home.
 *
 * Prima ogni sezione ridichiarava la propria pill eyebrow inline, e le sei
 * copie avevano divergito (tracking, ombre, allineamento): questo componente
 * è l'unica definizione, così l'occhio riconosce lo stesso pattern scorrendo.
 *
 * L'eyebrow è un <p> puramente decorativo dal punto di vista semantico: la
 * gerarchia del documento la porta l'<h2>.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "start",
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
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
      <p className="mb-5 w-fit rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground-muted">
        {eyebrow}
      </p>
      <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 max-w-xl text-foreground-muted", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
      {children}
    </Reveal>
  );
}
