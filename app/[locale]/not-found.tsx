import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Monta la chrome da sé invece di ereditarla, perché sta a livello `[locale]`
 * e non dentro `(site)`: il segmento dinamico `[vertical]` cattura ogni path a
 * un segmento sotto `/it/`, quindi è questo il 404 che vede anche chi sbaglia
 * a digitare un URL — e deve poter raggiungere il sito.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        <span className="text-sm font-medium tracking-[-0.01em] text-brand">
          {t("eyebrow")}
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-base text-foreground-muted">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="/" />} nativeButton={false}>
            {t("cta")}
          </Button>
          <Button
            render={<Link href="/work" />}
            nativeButton={false}
            variant="outline"
          >
            {t("secondaryCta")}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
