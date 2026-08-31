"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/** Monta la chrome da sé — vedi la nota in `not-found.tsx`. */
export default function LocaleError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        <span className="text-sm font-medium tracking-[-0.01em] text-destructive">
          {t("eyebrow")}
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base text-foreground-muted">
          {t("description")}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-foreground-muted/70">
            {t("digest", { digest: error.digest })}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => unstable_retry()}>{t("retry")}</Button>
          <Button render={<Link href="/" />} nativeButton={false} variant="outline">
            {t("cta")}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
