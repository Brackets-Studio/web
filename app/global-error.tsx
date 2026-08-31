"use client";

import { useEffect } from "react";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";
import "./globals.css";

// Rimpiazza l'intero root layout quando l'errore avviene lì: niente
// NextIntlClientProvider, Navbar o Footer disponibili, quindi testo statico
// bilingue e import espliciti di font/stili globali.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html
      className={`${spaceMono.variable} ${bricolage.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col items-center justify-center px-6 py-24 text-center">
        <span className="text-sm font-medium tracking-[-0.01em] text-destructive">
          Error / Errore
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl">
          Something went wrong / Qualcosa è andato storto
        </h1>
        <p className="mt-4 max-w-md text-base text-foreground-muted">
          An unexpected error occurred. / Si è verificato un errore
          inatteso.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-foreground-muted/70">
            {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-8 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          Try again / Riprova
        </button>
      </body>
    </html>
  );
}
