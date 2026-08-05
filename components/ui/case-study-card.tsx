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
        className="group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-background-elevated text-left shadow-sm outline-none transition-colors hover:border-brand focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden">
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

          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-border bg-background/70 px-2 py-1 font-mono text-xs text-foreground-muted backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-semibold tracking-[-0.01em] text-foreground">{title}</h3>

          <div className="mt-3">
            <p className="font-mono text-xs uppercase tracking-wide text-brand">{resultLabel}</p>
            <p className="mt-2 line-clamp-2 text-sm text-foreground-muted">{result}</p>
          </div>

          <div className="mt-6 flex items-center gap-2 font-mono text-sm text-brand">
            <span className="transition-[gap] duration-200">{viewLabel}</span>
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
