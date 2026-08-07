import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";
import { sanityFetch } from "@/sanity/client";
import { TESTIMONIALS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { Testimonial } from "@/sanity/types";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";

// Iniziali come fallback finché una testimonianza non ha ancora l'avatar,
// così la card resta pulita e non mostra mai un'immagine rotta.
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function Testimonials() {
  const locale = await getLocale();
  const t = await getTranslations("testimonials");

  const testimonials = await sanityFetch<Testimonial[]>({
    query: TESTIMONIALS_QUERY,
    params: { locale },
    tags: ["testimonial"],
  });

  if (testimonials.length === 0) return null;

  return (
    <StackedSection id="testimonianze">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="mb-6 w-fit uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
            {t("eyebrow")}
          </p>
          <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal
              key={item.id}
              index={index}
              className="flex flex-col rounded-lg border border-border bg-background-elevated p-6 shadow-sm"
            >
              <figure className="flex h-full flex-col">
                <Quote className="size-5 text-brand" strokeWidth={1.75} />
                <blockquote className="mt-4 flex-1 text-sm text-foreground">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  {item.avatar?.asset ? (
                    <Image
                      src={urlFor(item.avatar).width(96).height(96).fit("crop").url()}
                      alt={item.avatar.alt ?? item.authorName}
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground-muted ring-1 ring-border"
                    >
                      {initials(item.authorName)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.authorName}</p>
                    <p className="text-xs text-foreground-muted">{item.authorRole}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </StackedSection>
  );
}
