import { Loader2 } from "lucide-react";

/**
 * Copre solo l'attesa di `page.tsx`: `layout.tsx` in questo segmento fa il suo
 * fetch (`getVertical`) fuori dal boundary di questo `loading.tsx` (vedi i docs
 * Next in `node_modules/next/dist/docs/.../loading.md`), quindi non porta il
 * tema del preset — resta neutro di proposito.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div role="status" className="flex flex-col items-center gap-3 text-neutral-500">
        <Loader2 className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
        <span className="sr-only">Caricamento… / Loading…</span>
      </div>
    </div>
  );
}
