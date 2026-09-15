import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { Monogram } from "@/components/ui/monogram";
import { VerticalProof } from "@/components/verticals/vertical-proof";
import { VerticalDemos } from "@/components/verticals/vertical-demos";
import { CallbackForm } from "@/components/verticals/callback-form";
import { VerticalCtaLinks } from "@/components/verticals/cta-links";
import { client } from "@/sanity/client";
import { VERTICAL_SLUGS_QUERY } from "@/sanity/queries";
import { getVertical } from "@/sanity/verticals";
import { urlFor } from "@/sanity/image";
import type { VerticalDetail } from "@/sanity/types";
import { resolvePreset } from "@/lib/verticals/presets";
import { HERO_ID, telHref } from "@/lib/verticals/shared";
import { siteConfig } from "@/lib/site";



export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(VERTICAL_SLUGS_QUERY);
  return slugs.map(({ slug }) => ({ locale: "it", vertical: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; vertical: string }>;
}): Promise<Metadata> {
  const { locale, vertical: slug } = await params;
  if (locale !== "it") return {};

  const vertical = await getVertical(slug);
  if (!vertical) return {};

  const title = vertical.seo?.title || vertical.hero.title;
  const description = vertical.seo?.description || vertical.hero.subtitle || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/it/${slug}` },
    robots: {
      index: !vertical.seo?.noIndex,
      follow: !vertical.seo?.noIndex,
    },
  };
}

function verticalJsonLd(slug: string, vertical: VerticalDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: vertical.serviceType,
    name: vertical.hero.title,
    description: vertical.hero.subtitle ?? undefined,
    url: `${siteConfig.url}/it/${slug}`,
    areaServed: { "@type": "Place", name: siteConfig.areaServed },
    provider: {
      "@type": "LocalBusiness",
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: siteConfig.phone,
      areaServed: siteConfig.areaServed,
    },
  };
}

/**
 * L'intestazione di sezione delle landing.
 *
 * Non riusa `SectionHeader` della home: quella porta una pill eyebrow e una
 * larghezza pensate per il sito dello studio. Qui occhiello e titolo sono
 * vestiti dal preset (`.v-eyebrow`, `.v-title`), e non è un dettaglio di
 * colore: sulla ristorazione l'occhiello è un trattino con la scritta in mono
 * maiuscolo, sull'ospitalità una pastiglia tonda, sul fitness un blocco lime
 * inclinato. È lì che si sente che sono due mestieri diversi.
 */
function SectionTitle({
  label,
  title,
  children,
  center,
}: {
  label: string;
  title?: string | null;
  children?: ReactNode;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "text-center" : undefined}>
      <p className="v-eyebrow">
        <span>{label}</span>
      </p>
      {title && (
        <h2 className="v-title mt-4 text-3xl text-foreground sm:text-4xl">{title}</h2>
      )}
      {children}
    </Reveal>
  );
}

/**
 * Contenitore standard.
 *
 * Una larghezza sola per tutta la pagina — la stessa di header e footer
 * (`max-w-5xl`). Prima c'era una variante stretta per le sezioni di solo testo:
 * scorrendo, i bordi cambiavano posizione da una sezione all'altra e la pagina
 * sembrava montata a pezzi. Le sezioni che avevano poco da dire non si
 * restringono, si aprono su due colonne (vedi PREZZO e OBIEZIONI).
 */
function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-5 py-16 sm:px-8 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

export default async function VerticalPage({
  params,
}: {
  params: Promise<{ locale: string; vertical: string }>;
}) {
  const { locale, vertical: slug } = await params;
  if (locale !== "it") notFound();

  const vertical = await getVertical(slug);
  if (!vertical) notFound();

  const {
    hero,
    trust,
    sectionLabels,
    vibeImages,
    proof,
    benefits,
    process,
    price,
    objections,
    about,
    closingCta,
    relatedCaseStudies,
  } = vertical;

  const preset = resolvePreset(vertical.theme?.preset);
  const tel = telHref();
  const usableVibeImages = vibeImages.filter((image) => image.asset);

  /*
   * Le due CTA. Forma, famiglia, raggio e comportamento all'hover arrivano dal
   * preset via `.v-btn`: squadrato che si svuota sulla ristorazione, pillola
   * verde acqua che si solleva sull'ospitalità, blocco lime che scatta
   * lasciandosi dietro un'ombra dura sul fitness.
   */
  const ctas = (
    <VerticalCtaLinks
      vertical={slug}
      tel={tel}
      whatsapp={siteConfig.whatsapp}
      callLabel={hero.ctaLabel}
      whatsappLabel={hero.ctaWhatsappLabel}
    />
  );

  const heroImageUrl = hero.image?.asset
    ? urlFor(hero.image).width(1600).height(1100).fit("crop").url()
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(verticalJsonLd(slug, vertical)) }}
      />

      {/*
        HERO — testo a sinistra, foto dell'ambiente a destra.
        Prima la foto stava DIETRO il testo, sotto un velo al 70% più un
        gradiente: l'unico elemento che dice "questa pagina parla del tuo
        settore" arrivava all'occhio slavato, e la pagina finiva per somigliare a
        qualsiasi altra landing. Qui la foto è un blocco suo, a piena forza,
        grande quanto la colonna del testo. La texture del preset le sta dietro,
        sbordando: è l'unico punto in cui una tovaglia a quadretti si vede
        davvero, invece di essere un velo al 7% su tutta la pagina.
        Su mobile la foto viene prima del testo — è ciò che si riconosce da
        lontano, e va vista prima di leggere.
      */}
      <div id={HERO_ID} className="px-5 pt-10 pb-14 sm:px-8 sm:pt-16 sm:pb-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {heroImageUrl && (
            <div className="relative order-first lg:order-last">
              {preset.texture !== "none" && (
                <div
                  aria-hidden
                  className={`absolute -inset-3 -z-10 opacity-[0.13] sm:-inset-5 pattern-${preset.texture}`}
                />
              )}
              <div className="v-media relative aspect-4/3 w-full lg:aspect-5/6">
                <Image
                  src={heroImageUrl}
                  alt={hero.image?.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  priority
                  placeholder={hero.image?.asset?.metadata.lqip ? "blur" : undefined}
                  blurDataURL={hero.image?.asset?.metadata.lqip ?? undefined}
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div>
            {hero.eyebrow && (
              <p className="v-eyebrow">
                <span>{hero.eyebrow}</span>
              </p>
            )}
            <h1 className="v-title mt-5 text-4xl text-foreground sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            {hero.subtitle && (
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-foreground-muted">
                {hero.subtitle}
              </p>
            )}
            {hero.priceDisplay && (
              <p className="mt-7">
                <span className="v-title text-3xl text-brand sm:text-4xl">
                  {hero.priceDisplay}
                </span>
                {hero.priceNote && (
                  <span className="mt-1.5 block text-sm text-foreground-muted">
                    {hero.priceNote}
                  </span>
                )}
              </p>
            )}
            <div className="mt-9">{ctas}</div>
          </div>
        </div>
      </div>

      {/* FIDUCIA — le tre paure tolte di mezzo prima che diventino obiezioni. */}
      {trust.length > 0 && (
        <div className="border-y border-border bg-background-elevated">
          <ul className="mx-auto grid max-w-5xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8">
            {trust.slice(0, 3).map((item) => (
              <li key={item.title} className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.text && (
                    <p className="mt-0.5 text-sm text-foreground-muted">{item.text}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* BENEFICI */}
      {benefits.items.length > 0 && (
        <Section>
          <SectionTitle label={sectionLabels.benefits} title={benefits.title} />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {benefits.items.map((benefit, index) => (
              <li key={benefit.title}>
                <Reveal index={index} className="h-full">
                  {/* `.v-benefit`: testo nudo sulla ristorazione, card tonda
                      sull'ospitalità, barra lime a sinistra sul fitness. */}
                  <div className="v-benefit">
                    <p className="v-title text-lg text-foreground">{benefit.title}</p>
                    <p className="mt-2 leading-relaxed text-foreground-muted">
                      {benefit.text}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* PROVA — un telefono grande, il testo accanto. */}
      {proof.screenshots.length > 0 && (
        <Section className="border-y border-border bg-background-elevated">
          <SectionTitle label={sectionLabels.proof} title={proof.title} center>
            {proof.subtitle && (
              <p className="mx-auto mt-3 max-w-xl text-foreground-muted">{proof.subtitle}</p>
            )}
            {proof.intro && (
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-foreground-muted">
                {proof.intro}
              </p>
            )}
          </SectionTitle>
          <div className="mt-12">
            <VerticalProof
              anonymousCaption={proof.anonymousCaption ?? ""}
              screenshots={proof.screenshots}
            />
          </div>
        </Section>
      )}

      {/* COME FUNZIONA — con la banda di foto d'ambiente accanto, dove le foto
          fanno il loro mestiere invece di scorrere in un marquee. */}
      {process.steps.length > 0 && (
        <Section>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <SectionTitle label={sectionLabels.process} title={process.title} />
              <ol className="mt-10 flex flex-col gap-8">
                {process.steps.map((step, index) => (
                  <li key={step.title}>
                    <Reveal index={index} className="flex gap-4">
                      <span aria-hidden className="v-step shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="v-title text-lg text-foreground">{step.title}</p>
                        <p className="mt-1.5 leading-relaxed text-foreground-muted">
                          {step.text}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>

            {usableVibeImages.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 lg:mt-6">
                {usableVibeImages.map((image, index) => (
                  <li
                    key={image.asset?._id ?? index}
                    // La prima foto occupa due colonne: una griglia 2×N di
                    // foto tutte uguali non è un collage, è una tabella.
                    className={index === 0 ? "col-span-2" : undefined}
                  >
                    <div
                      className={`v-media relative ${
                        index === 0 ? "aspect-16/10" : "aspect-square"
                      }`}
                    >
                      <Image
                        src={urlFor(image).width(index === 0 ? 720 : 360).url()}
                        alt={image.alt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 400px, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      )}

      {/*
        PREZZO — una scheda incorniciata, non una fascia tinta.
        Prima la sezione stava su `bg-brand-subtle`: a tutta larghezza quel tinta
        diventa la cosa più rumorosa della pagina, e su un preset caldo legge
        rosa-salmone invece che "trattoria". Qui il colore torna a fare il suo
        mestiere — marca il solo numero — e a dare peso alla sezione è la
        cornice del pannello.
        Il fondo è `.v-band` (`--v-surface-alt`) e non più un beige scritto a
        mano: quel beige, sul preset fitness che è scuro, disegnava una fascia
        chiara con sopra del testo chiaro.
      */}
      <section className="v-band relative isolate overflow-hidden border-y border-border px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          {/*
            Colonna sinistra: cosa si porta a casa, più i pulsanti.
            Prima cosa c'è dentro e quanto costa stavano impilati nella stessa
            scheda stretta, e la lista finiva sotto il numero — cioè dopo il
            momento in cui uno decide. Affiancate, si leggono insieme.
          */}
          <div>
            <SectionTitle label={sectionLabels.price} title={price.title} />

            {price.oneTime?.features && price.oneTime.features.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3">
                {price.oneTime.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-foreground">
                    <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {price.oneTime?.includes && (
              <p className="mt-5 text-sm text-foreground-muted">{price.oneTime.includes}</p>
            )}

            <div className="mt-9">{ctas}</div>
          </div>

          {/* Colonna destra: la lavagna dei prezzi. Solo i numeri. */}
          <div className="v-panel p-8 sm:p-10">
            {price.installments?.amount && (
              <div className="text-center">
                {price.installments.label && (
                  <p className="v-label text-xs uppercase text-foreground-muted">
                    {price.installments.label}
                  </p>
                )}
                <p className="v-title mt-3 text-4xl text-brand sm:text-5xl">
                  {price.installments.amount}
                </p>
                {price.installments.note && (
                  <p className="mt-3 text-sm text-foreground-muted">
                    {price.installments.note}
                  </p>
                )}
              </div>
            )}

            {price.oneTime?.amount && (
              <p className="mt-8 border-t-2 border-dashed border-border pt-6 text-center text-sm text-foreground-muted">
                {price.oneTime.label ?? "Oppure tutto in una volta"}
                <span className="v-title mt-1 block text-2xl text-foreground">
                  {price.oneTime.amount}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CASE STUDY COLLEGATI */}
      {relatedCaseStudies.length > 0 && (
        <Section>
          <SectionTitle label={sectionLabels.cases} title='Case study collegati' />
          {/*
            Card verticali, non righe.
            Prima erano righe con una miniatura da 96px accanto al nome: di un
            sito fatto bene, in 96px, non si vede niente — e "guarda che bel
            lavoro" con l'immagine grande come un'icona è una promessa che la
            card stessa smentisce. Qui l'immagine viene prima ed è larga quanto
            la card. Con un solo case study la card non si restringe a metà
            pagina: si corica — immagine a sinistra, testo a destra — e tiene la
            stessa larghezza di tutte le altre sezioni.
          */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {relatedCaseStudies.map((cs) => {
              const solo = relatedCaseStudies.length === 1;
              return (
                <Link
                  key={cs.id}
                  href={`/work/${cs.slug}`}
                  className={`v-card group flex flex-col transition-transform hover:-translate-y-1 ${
                    solo ? "sm:col-span-2 sm:flex-row" : ""
                  }`}
                >
                  <div
                    className={`relative aspect-16/10 w-full bg-muted ${
                      solo ? "sm:aspect-4/3 sm:w-1/2 sm:shrink-0" : ""
                    }`}
                  >
                    {cs.mainImage?.asset ? (
                      <Image
                        src={urlFor(cs.mainImage).width(900).height(560).fit("crop").url()}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 480px, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <Monogram title={cs.name} className="v-title text-4xl text-foreground/20" />
                    )}
                  </div>
                  <div
                    className={`flex items-start gap-3 p-5 ${
                      solo ? "sm:flex-1 sm:self-center sm:p-8" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="v-title text-lg text-foreground">{cs.name}</p>
                      {cs.result && (
                        <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                          {cs.result}
                        </p>
                      )}
                    </div>
                    <ArrowUpRight
                      className="mt-1 size-4 shrink-0 text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </div>
                  
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* DEMO — esempi finti di `vetrina/`, subito dopo la prova vera e mai
          prima: in outbound la demo apre e la prova chiude, qui è al contrario
          perché chi arriva da Google è uno sconosciuto e la credibilità viene
          prima (`docs/ideas/vetrina-demo-per-tipologia.md` §10.4). */}

        <Section className="border-t border-border bg-background-elevated">
          <SectionTitle label="Esempi" title="Com'è per il tuo mestiere" />
          <div className="mt-12">
            <VerticalDemos demos={proof.demos} />
          </div>
        </Section>


      {/* OBIEZIONI — accordion: chi ha quella paura la apre, gli altri scorrono. */}
      {objections.items.length > 0 && (
        <Section className="border-t border-border">
          {/* Titolo a sinistra, domande a destra: a piena larghezza un accordion
              da solo darebbe righe lunghissime e un titolo appeso in cima. */}
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
            <SectionTitle label={sectionLabels.objections} title={objections.title} />
            <Accordion>
              {objections.items.map((objection, index) => (
                <AccordionItem key={objection.fear} value={index} className="v-faq-item">
                  <AccordionTrigger className="py-5 text-base">
                    {objection.fear}
                  </AccordionTrigger>
                  <AccordionPanel className="pb-5 text-base leading-relaxed">
                    {objection.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      )}

      {/* CHI SONO + RICHIAMATA — l'ultima cosa non è un muro di CTA ma una
          persona con un nome, accanto al modo più leggero di farsi contattare. */}
      <Section className="border-t border-border bg-background-elevated">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionTitle label={sectionLabels.about} />
            {about?.text && (
              <p className="mt-6 text-lg leading-relaxed text-foreground">{about.text}</p>
            )}
            <p className="v-label mt-6 text-sm text-foreground">
              — Tobia, {siteConfig.areaServed}
              <br />
              <a
                href={tel}
                className="underline decoration-border underline-offset-4 hover:text-brand"
              >
                {siteConfig.phone}
              </a>
            </p>

            {closingCta?.text && (
              <p className="mt-8 border-t border-dashed border-border pt-6 leading-relaxed text-foreground-muted">
                <span className="v-label text-foreground">P.S.</span>{" "}
                {closingCta.title && (
                  <strong className="text-foreground">{closingCta.title}. </strong>
                )}
                {closingCta.text}
              </p>
            )}
          </div>

          <CallbackForm
            vertical={slug}
            title={hero.callbackTitle ?? "Preferisci che ti chiami io?"}
            text={hero.callbackText ?? "Lasciami nome e numero: ti richiamo io, quando ti fa comodo."}
          />
        </div>
      </Section>
    </>
  );
}
