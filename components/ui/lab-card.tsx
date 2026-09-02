"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Monogram } from "./monogram";

export function LabCard({
  title,
  kindLabel,
  statusLabel,
  description,
  tags,
  image,
  demoUrl,
  repoUrl,
  demoLabel,
  repoLabel,
  index,
  headingLevel: Heading = "h3",
}: {
  title: string;
  kindLabel: string;
  statusLabel?: string;
  description: string;
  tags: string[];
  image?: string;
  demoUrl?: string | null;
  repoUrl?: string | null;
  demoLabel: string;
  repoLabel: string;
  index: number;
  /** `/lab` è un indice sotto un solo `h1`: le card lì sono `h2`. */
  headingLevel?: "h2" | "h3";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-elevated/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden border-b border-border bg-neutral-200/50">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Monogram title={title} />
        )}
        {statusLabel && (
          <span className="absolute top-3 right-3 rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-xs text-foreground-muted backdrop-blur-sm">
            {statusLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-xs uppercase tracking-wider text-brand">{kindLabel}</p>
        <Heading className="mt-2 text-xl font-semibold tracking-[-0.01em] text-foreground">{title}</Heading>
        <p className="mt-2 flex-1 text-sm text-foreground-muted">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-border bg-background/70 px-2 py-1 font-mono text-xs text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-border pt-4 font-mono text-sm">
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-brand"
            >
              {demoLabel}
              <ArrowUpRight
                size={14}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
          )}
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground-muted transition-colors hover:text-foreground"
            >
              <Code2 size={14} aria-hidden />
              {repoLabel}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
