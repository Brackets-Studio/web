"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Monogram } from "./monogram";

export function CaseStudyCard({
  slug,
  title,
  tags,
  result,
  resultLabel,
  viewLabel,
  image,
  index,
}: {
  slug: string;
  title: string;
  tags: string[];
  result: string;
  resultLabel: string;
  viewLabel: string;
  image?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/work/${slug}`}
        className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-background-elevated/60 text-left shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-200/50 border-b border-border">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <Monogram title={title} />
          )}        
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-border bg-background/70 px-2 py-1 font-mono text-xs text-foreground backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-semibold tracking-[-0.01em] text-foreground">
            {title}
          </h3>

          <div className="mt-3">
            <p className="font-mono text-xs uppercase tracking-wider text-foreground-muted">{resultLabel}</p>
            <p className="mt-2 line-clamp-2 text-sm text-foreground-muted">{result}</p>
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-border pt-4 font-mono text-sm text-brand">
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
