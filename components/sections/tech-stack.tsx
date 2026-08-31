import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";

// Loghi con variante chiara/scura: la giusta viene mostrata via CSS in base
// alla classe .dark su <html> (nessun JS, nessun flash all'idratazione).
// I file single (typescript, swift) usano lo stesso asset per entrambi i temi.
const LOGOS = [
  { name: "Next.js", light: "/icons/next_light.svg", dark: "/icons/next_dark.svg" },
  { name: "React", light: "/icons/react_light.svg", dark: "/icons/react_dark.svg" },
  { name: "TypeScript", light: "/icons/typescript.svg", dark: "/icons/typescript.svg" },
  { name: "PostgreSQL", light: "/icons/postgre_light.svg", dark: "/icons/postgre_dark.svg" },
  { name: "Expo", light: "/icons/expo_light.svg", dark: "/icons/expo_dark.svg" },
  { name: "Swift", light: "/icons/swift.svg", dark: "/icons/swift.svg" },
  { name: "AWS", light: "/icons/aws_light.svg", dark: "/icons/aws_dark.svg" },
  { name: "Sanity", light: "/icons/sanity_light.svg", dark: "/icons/sanity_dark.svg" },
  { name: "Telnyx", light: "/icons/telnyx_light.png", dark: "/icons/telnyx_dark.png" },
] as const;

function LogoItem({ name, light, dark }: (typeof LOGOS)[number]) {
  return (
    <li className="flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={light}
        alt={name}
        loading="lazy"
        decoding="async"
        className="h-7 w-auto opacity-70 transition-opacity hover:opacity-100 dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dark}
        alt={name}
        loading="lazy"
        decoding="async"
        className="hidden h-7 w-auto opacity-70 transition-opacity hover:opacity-100 dark:block"
      />
    </li>
  );
}

export async function TechStack() {
  const techStackT = await getTranslations("techStack");

  return (
    <StackedSection>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Reveal className="flex flex-col items-center gap-8">
          <div className="max-w-xl text-center">
            <p className="font-mono text-lg uppercase tracking-wider text-foreground-muted">
              {techStackT("title")}
            </p>
            {/* Il perché conta per un imprenditore non è la lista, è il non
                restare in ostaggio del fornitore. */}
            <p className="mt-3 text-sm text-foreground-muted">
              {techStackT("subtitle")}
            </p>
          </div>

          {/* Il marquee scorre in loop continuo: due tracce identiche, la seconda
              aria-hidden. L'animazione (solo transform) è nel CSS globale. */}
          <div className="marquee-mask relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="marquee-track flex w-max">
              <ul className="flex shrink-0 items-center gap-14 pr-14">
                {LOGOS.map((logo) => (
                  <LogoItem key={logo.name} {...logo} />
                ))}
              </ul>
              <ul className="flex shrink-0 items-center gap-14 pr-14" aria-hidden>
                {LOGOS.map((logo) => (
                  <LogoItem key={`${logo.name}-dup`} {...logo} />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </StackedSection>
  );
}
