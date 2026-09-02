import Image from "next/image";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { sanityFetch } from "@/sanity/client";
import { SOCIAL_PROOF_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { SocialProof as SocialProofData } from "@/sanity/types";
import { repeatToMinLength } from "@/lib/utils";

/**
 * Striscia di fiducia subito sotto l'hero: marquee di loghi clienti.
 *
 * Stesso pattern CSS-only di `components/sections/tech-stack.tsx`
 * (`.marquee-mask`/`.marquee-track` in `globals.css`): due liste identiche
 * affiancate, la seconda `aria-hidden`, animate via `transform` col
 * compositor — niente JS, si ferma da sola su hover e `prefers-reduced-motion`.
 *
 * Contenuto interamente da Sanity (singleton `socialProof`): senza loghi la
 * sezione non renderizza nulla, invece di uno spazio vuoto.
 */
export async function SocialProof({ locale }: { locale: string }) {
  const data = await sanityFetch<SocialProofData | null>({
    query: SOCIAL_PROOF_QUERY,
    params: { locale },
    tags: ["socialProof"],
  });

  const logos = data?.logos.filter((logo) => logo.image?.asset) ?? [];

  if (logos.length === 0) return null;

  // Con pochi loghi una singola passata è più stretta del contenitore: la
  // ripetiamo fino a una larghezza sicura prima di duplicarla per il loop.
  const marqueeLogos = repeatToMinLength(logos, 8);

  return (
    <StackedSection>
      <div className="mx-auto max-w-6xl px-6 py-14">
        {data?.heading && (
          <Reveal>
            <p className="mb-8 text-center font-mono text-xs uppercase tracking-wider text-foreground-muted">
              {data.heading}
            </p>
          </Reveal>
        )}

        <Reveal
          index={1}
          className="marquee-mask relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        >
          <div className="marquee-track flex w-max">
            {[0, 1].map((pass) => (
              <ul
                key={pass}
                className="flex shrink-0 items-center gap-16 pr-16"
                aria-hidden={pass === 1 || undefined}
              >
                {marqueeLogos.map((logo, index) => {
                  const image = (
                    <Image
                      src={urlFor(logo.image!).height(64).url()}
                      alt={logo.alt ?? logo.name ?? ""}
                      width={180}
                      height={64}
                      key={index}
                      className="h-14 w-auto grayscale opacity-60 transition-[opacity,filter] hover:grayscale-0 hover:opacity-100 sm:h-16"
                    />
                  );
                  return (
                    <li key={`${pass}-${index}`} className="flex shrink-0 items-center">
                      {logo.href ? (
                        <a href={logo.href} target="_blank" rel="noopener noreferrer">
                          {image}
                        </a>
                      ) : (
                        image
                      )}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </Reveal>
      </div>
    </StackedSection>
  );
}
