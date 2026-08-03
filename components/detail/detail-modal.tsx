"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useDetail } from "./detail-context";
import { Badge } from "@/components/ui/badge";
import { Monogram } from "@/components/ui/monogram";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function DetailModal() {
  const { activeItem, triggerEl, close } = useDetail();
  const t = useTranslations("modal");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeItem) return;

    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      triggerEl?.focus();
    };
  }, [activeItem, close, triggerEl]);

  const rect = activeItem && triggerEl ? triggerEl.getBoundingClientRect() : null;
  const originX = rect
    ? rect.left + rect.width / 2 - window.innerWidth / 2
    : 0;
  const originY = rect
    ? rect.top + rect.height / 2 - window.innerHeight / 2
    : 0;

  return (
    <AnimatePresence>
      {activeItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6"
          onClick={close}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${activeItem.id}-title`}
            initial={{ opacity: 0, scale: 0.94, x: originX * 0.4, y: originY * 0.4 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-background-elevated shadow-md outline-none"
          >
            {activeItem.kind === "case-study" && (
              <div className="relative aspect-21/9 w-full overflow-hidden rounded-t-lg">
                {activeItem.image ? (
                  <Image
                    src={activeItem.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 42rem, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <Monogram
                    title={activeItem.title}
                    className="font-mono text-8xl font-bold tracking-tight text-brand/25 select-none sm:text-9xl"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-background-elevated via-transparent to-transparent" />
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("close")}
                  className="absolute top-4 right-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/70 text-foreground-muted backdrop-blur-sm transition-colors hover:border-brand hover:text-foreground"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3
                  id={`${activeItem.id}-title`}
                  className="text-2xl font-semibold tracking-[-0.01em] text-foreground"
                >
                  {activeItem.title}
                </h3>
                {activeItem.kind !== "case-study" && (
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t("close")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-foreground-muted transition-colors hover:border-brand hover:text-foreground"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {activeItem.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>

              {activeItem.kind === "case-study" && (
                <dl className="mt-6 grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-3">
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wide text-brand">
                      {activeItem.problemLabel}
                    </dt>
                    <dd className="mt-2 text-sm text-foreground-muted">
                      {activeItem.problem}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wide text-brand">
                      {activeItem.solutionLabel}
                    </dt>
                    <dd className="mt-2 text-sm text-foreground-muted">
                      {activeItem.solution}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wide text-brand">
                      {activeItem.resultLabel}
                    </dt>
                    <dd className="mt-2 text-sm text-foreground-muted">
                      {activeItem.result}
                    </dd>
                  </div>
                </dl>
              )}

              <p className="mt-6 text-sm leading-relaxed text-foreground-muted">
                {activeItem.detail.summary}
              </p>

              <ul className="mt-6 flex flex-col gap-2">
                {activeItem.detail.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
