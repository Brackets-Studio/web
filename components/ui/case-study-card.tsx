"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Monogram } from "./monogram";

/**
 * La card di un case study, in due formati.
 *
 * `featured` esiste per una ragione sola: in home sei sezioni di fila usavano
 * una griglia di card tutte uguali, e l'occhio non aveva un punto in cui
 * fermarsi. Il primo progetto occupa tutta la larghezza con l'immagine grande a
 * sinistra; gli altri due restano `default` sotto. In una pagina per il resto
 * regolarissima, l'unica irregolarità è ciò che fa fermare lo sguardo — ed è
 * giusto che tocchi ai lavori fatti, non alle FAQ.
 *
 * Su `/work` invece le card restano tutte `default`: lì è un indice, e in un
 * indice la regolarità è la cosa giusta.
 */
export function CaseStudyCard({
  slug,
  title,
  tags,
  result,
  resultLabel,
  viewLabel,
  image,
  index,
  variant = "default",
  headingLevel: Heading = "h3",
}: {
  slug: string;
  title: string;
  tags: string[];
  result: string;
  resultLabel: string;
  viewLabel: string;
  image?: string;
  index: number;
  variant?: "default" | "featured";
  /** `/work` è un indice sotto un solo `h1`: le card lì sono `h2`. In home
   *  sono annidate sotto l'`h2` di `SectionHeader`, quindi restano `h3`. */
  headingLevel?: "h2" | "h3";
}) {
  const featured = variant === "featured";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn(featured && "h-full")}
    >
      <Link
        href={`/work/${slug}`}
        className={cn(
          "group flex h-full w-full overflow-hidden rounded-lg border border-border bg-background-elevated/60 text-left shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand",
          featured ? "flex-col lg:flex-row" : "flex-col",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden border-border bg-neutral-200/50 dark:bg-neutral-800/50",
            featured
              ? "aspect-16/10 w-full border-b lg:aspect-auto lg:w-[58%] lg:border-r lg:border-b-0"
              : "aspect-16/10 w-full border-b",
          )}
        >
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes={
                featured
                  ? "(min-width: 1024px) 58vw, 100vw"
                  : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              }
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <Monogram title={title} />
          )}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col p-6",
            featured && "justify-center lg:p-10",
          )}
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-border bg-background/70 px-2 py-1 font-mono text-xs text-foreground backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <Heading
            className={cn(
              "font-semibold tracking-[-0.01em] text-foreground",
              featured ? "text-2xl sm:text-3xl" : "text-xl",
            )}
          >
            {title}
          </Heading>

          <div className="mt-3">
            <p className="font-mono text-xs uppercase tracking-wider text-foreground-muted">
              {resultLabel}
            </p>
            {/* Sul progetto in evidenza il risultato si legge per intero: è la
                cosa che deve convincere, troncarla a due righe la sprecherebbe. */}
            <p
              className={cn(
                "mt-2 text-foreground-muted",
                featured ? "max-w-prose" : "line-clamp-2 text-sm",
              )}
            >
              {result}
            </p>
          </div>

          <div
            className={cn(
              "mt-6 flex items-center gap-2 border-t border-border pt-4 font-mono text-sm text-brand",
              featured && "mt-8",
            )}
          >
            <span>{viewLabel}</span>
            <span
              aria-hidden
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            >
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
