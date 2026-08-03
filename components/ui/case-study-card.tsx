"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useDetail, type DetailItem } from "@/components/detail/detail-context";
import { Monogram } from "./monogram";

export function CaseStudyCard({
  item,
  index,
}: {
  item: DetailItem;
  index: number;
}) {
  const { open } = useDetail();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={() => open(item, buttonRef.current)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-background-elevated text-left shadow-sm outline-none transition-colors hover:border-brand focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <Monogram title={item.title} />
        )}

        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
          {item.tags.map((tag) => (
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
        <h3 className="text-xl font-semibold tracking-[-0.01em] text-foreground">
          {item.title}
        </h3>

        <div className="mt-3">
          <p className="font-mono text-xs uppercase tracking-wide text-brand">
            {item.resultLabel}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-foreground-muted">
            {item.result}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 font-mono text-sm text-brand">
          <span className="transition-[gap] duration-200">View case study</span>
          <span
            aria-hidden
            className="transition-transform duration-200 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </motion.button>
  );
}
