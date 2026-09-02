import { Loader2 } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";

/**
 * `loading.tsx` non riceve `params` (vedi i docs Next in `node_modules/next/dist/docs`),
 * quindi non può risolvere la lingua: il testo per lo screen reader resta bilingue.
 *
 * Resta volutamente leggero — è UI che deve essere pronta all'istante, non un
 * calco della pagina che sta caricando (che qui cambia da pagina a pagina).
 */
export default function Loading() {
  return (
    <StackedSection>
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
        <div role="status" className="flex flex-col items-center gap-3 text-foreground-muted">
          <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
          <span className="sr-only">Caricamento… / Loading…</span>
        </div>
      </div>
    </StackedSection>
  );
}
