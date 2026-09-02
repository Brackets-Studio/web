import { siteConfig } from "@/lib/site";
import { Reveal } from "../ui/reveal";
import { CalendarClock, MessageCircle } from "lucide-react";
import Link from "next/link";

const CtaSection = ({
  textSettings
}: {
  textSettings: {
    eyebrow: string;
    title: string;
    text: string;
    button: string;
    buttonSecondary: string;
  }
}) => {

  return (
    <Reveal className="relative mt-16 overflow-hidden rounded-2xl border border-border bg-background-elevated">
      {/* Firma del brand: le parentesi graffie del wordmark, riprese qui giganti
          e sfumate — la stessa idea di "{ tutto quello che ti serve }" applicata
          alla call to action invece che al logo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--brand-subtle)_0%,transparent_65%)] opacity-40"
      />

      <div className="relative grid gap-8 px-6 py-14 text-center sm:px-12 sm:py-16 md:grid-cols-[1.4fr_auto] md:items-center md:text-left">
        <div>
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-foreground-muted md:mx-0">
            <CalendarClock className="size-3.5" aria-hidden />
            {textSettings.eyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-3xl">
            {textSettings.title}
          </h2>
          <p className="mt-3 text-pretty text-foreground-muted">{textSettings.text}</p>
        </div>

        <div className="flex w-full flex-col gap-3 ">
          <a
            href={siteConfig.booking}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-3.5 text-sm font-medium text-brand-foreground shadow-sm transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            <CalendarClock className="size-4 transition-transform duration-200 group-hover:rotate-[-8deg]" aria-hidden />
              {textSettings.button}
          </a>
          <Link
            href="/#contatti"
            className="inline-flex w-full items-center justify-center gap-2 rounded-pill border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-subtle/40 hover:text-brand"
          >
            <MessageCircle className="size-4" aria-hidden />
              {textSettings.buttonSecondary}
          </Link>
        </div>
      </div>
    </Reveal>
  );
};

export default CtaSection;
