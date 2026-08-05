"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, CalendarClock } from "lucide-react";
import { StackedSection } from "@/components/layout/stacked-section";
import { submitContactForm, type ContactFormState } from "@/lib/actions/contact";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const PROJECT_TYPES = ["web", "mobile", "ai", "other"] as const;

const initialState: ContactFormState = { status: "idle" };

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none transition-colors focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 aria-invalid:border-destructive";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-[100px] bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function Contact() {
  const t = useTranslations("contact");
  const [state, formAction] = useActionState(submitContactForm, initialState);

  return (
    <StackedSection id="contatti" className='bg-neutral-200/20 dark:bg-neutral-900'>
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <p className="mb-6 w-fit tracking-wider uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
              {t("eyebrow")}
            </p>
            <h2 className="text-4xl font-bold tracking-[-0.02em] text-foreground">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-md text-foreground-muted">{t("subtitle")}</p>
            <p className="mt-8 flex items-center gap-2 text-sm text-foreground-muted">
              <span className="size-1.5 shrink-0 rounded-full bg-brand" />
              {t("response")}
            </p>

            <a
              href={siteConfig.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-[100px] border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-brand"
            >
              <CalendarClock className="size-4 text-brand" aria-hidden />
              {t("bookCall")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: 0.1, ease: EASE_OUT }}
            className="rounded-4xl border border-border bg-background/30 p-6 shadow-sm sm:p-8"
          >
            {state.status === "success" ? (
              <div className="flex flex-col items-start gap-3 py-6">
                <CheckCircle2 className="size-8 text-brand" aria-hidden />
                <p className="text-lg font-semibold text-foreground">{t("success.title")}</p>
                <p className="text-sm text-foreground-muted">{t("success.body")}</p>
              </div>
            ) : (
              <form action={formAction} className="flex flex-col gap-5" noValidate>
                {/* Honeypot — hidden from real users via CSS, not display:none, so basic bots that skip hidden fields still fill it. */}
                <div className="absolute left-[-9999px] w-px h-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="company">Azienda</label>
                  <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      {t("fields.name.label")}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder={t("fields.name.placeholder")}
                      aria-invalid={!!state.fieldErrors?.name}
                      className={inputClass}
                    />
                    {state.fieldErrors?.name && (
                      <p className="text-xs text-destructive">{t("fields.name.error")}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {t("fields.email.label")}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={t("fields.email.placeholder")}
                      aria-invalid={!!state.fieldErrors?.email}
                      className={inputClass}
                    />
                    {state.fieldErrors?.email && (
                      <p className="text-xs text-destructive">{t("fields.email.error")}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="projectType" className="text-sm font-medium text-foreground">
                    {t("fields.projectType.label")}
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    defaultValue=""
                    className={cn(inputClass, "appearance-none")}
                  >
                    <option value="" disabled>
                      {t("fields.projectType.placeholder")}
                    </option>
                    {PROJECT_TYPES.map((key) => (
                      <option key={key} value={key}>
                        {t(`fields.projectType.options.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    {t("fields.message.label")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder={t("fields.message.placeholder")}
                    aria-invalid={!!state.fieldErrors?.message}
                    className={cn(inputClass, "resize-none")}
                  />
                  {state.fieldErrors?.message && (
                    <p className="text-xs text-destructive">{t("fields.message.error")}</p>
                  )}
                </div>

                {state.status === "error" && state.message && (
                  <p role="alert" className="text-sm text-destructive">
                    {state.message}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
                  <SubmitButton label={t("submit")} pendingLabel={t("submitting")} />
                  <p className="text-xs text-foreground-muted">
                    {t.rich("privacyNote", {
                      link: (chunks) => (
                        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                          {chunks}
                        </Link>
                      ),
                    })}
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </StackedSection>
  );
}
