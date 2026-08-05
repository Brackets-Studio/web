"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "bracket-cookie-ack";
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const listeners = new Set<() => void>();

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === null;
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function acknowledge() {
    localStorage.setItem(STORAGE_KEY, "1");
    for (const listener of listeners) listener();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label={t("text")}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-border bg-background-elevated p-4 shadow-md sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-foreground-muted">
            {t("text")}{" "}
            <Link href="/cookie-policy" className="underline underline-offset-2 hover:text-foreground">
              {t("link")}
            </Link>
          </p>
          <button
            type="button"
            onClick={acknowledge}
            className="inline-flex shrink-0 items-center justify-center rounded-[100px] bg-brand px-4 py-2 text-xs font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("accept")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
