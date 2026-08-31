import Link from "next/link";
import { Button } from "@/components/ui/button";

// Fallback per URL non gestiti dal middleware next-intl (es. richieste senza
// prefisso locale che non vengono riscritte). Non ha accesso al locale, quindi
// niente next-intl qui: testo bilingue statico.
export default function RootNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <span className="text-sm font-medium tracking-[-0.01em] text-brand">
        404
      </span>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl">
        Page not found / Pagina non trovata
      </h1>
      <p className="mt-4 text-base text-foreground-muted">
        The page you&apos;re looking for doesn&apos;t exist. / La pagina che
        stai cercando non esiste.
      </p>
      <div className="mt-8">
        <Button render={<Link href="/" />} nativeButton={false}>
          Home
        </Button>
      </div>
    </main>
  );
}
