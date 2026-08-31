"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { track } from "@vercel/analytics";
import { submitQuoteForm, type QuoteFormState } from "@/lib/actions/quote";
import type { PricingSettings } from "@/sanity/types";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const initialState: QuoteFormState = { status: "idle" };

type Phase = "service" | "question" | "result";

const cardClass =
  "w-full rounded-lg border border-border bg-background-elevated p-4 text-left text-sm text-foreground transition-colors hover:border-brand data-[selected=true]:border-brand data-[selected=true]:bg-brand-subtle";

const inputClass =
  "w-full rounded-lg border border-border bg-background-elevated px-3.5 py-3 text-base text-foreground placeholder:text-foreground-muted outline-none transition-colors focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 aria-invalid:border-destructive";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Preventivatore multi-step: scelta servizio → domande adattive →
 * fascia di prezzo/tempi calcolati da `pricingSettings` → form di contatto.
 *
 * Il calcolo (`basePrice * Π multiplier + Σ add`, poi arrotondato in fascia
 * ± `rangeSpreadPercent`) è puro front-end: i numeri arrivano da Sanity, così
 * cambiare un prezzo in Studio aggiorna anche questo componente senza deploy.
 */
export function QuoteCalculator({
  settings,
  locale,
}: {
  settings: PricingSettings;
  locale: string;
}) {
  const t = useTranslations("quote");
  const [phase, setPhase] = useState<Phase>("service");
  const [serviceKey, setServiceKey] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formState, formAction] = useActionState(submitQuoteForm, initialState);

  const questions = settings.quoteQuestions;
  const service = settings.services.find((s) => s.key === serviceKey) ?? null;
  const totalSteps = questions.length + 1;
  const currentStepNumber =
    phase === "service" ? 1 : phase === "question" ? questionIndex + 2 : totalSteps;

  function selectService(key: string) {
    setServiceKey(key);
    track("quote_step", { step: "service", value: key });
    if (questions.length > 0) {
      setQuestionIndex(0);
      setPhase("question");
    } else {
      setPhase("result");
      track("quote_result_view", { service: key });
    }
  }

  function selectAnswer(questionKey: string, optionKey: string) {
    const next = { ...answers, [questionKey]: optionKey };
    setAnswers(next);
    track("quote_step", { step: questionKey, value: optionKey });
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setPhase("result");
      track("quote_result_view", { service: serviceKey ?? "" });
    }
  }

  function goBack() {
    if (phase === "result") {
      if (questions.length > 0) {
        setQuestionIndex(questions.length - 1);
        setPhase("question");
      } else {
        setPhase("service");
      }
      return;
    }
    if (questionIndex === 0) {
      setPhase("service");
    } else {
      setQuestionIndex((i) => i - 1);
    }
  }

  function restart() {
    setPhase("service");
    setServiceKey(null);
    setQuestionIndex(0);
    setAnswers({});
  }

  const estimate = useMemo(() => {
    if (!service) return null;
    let price = service.basePrice;
    let weeks = service.baseTimelineWeeks;
    const answerLabels: string[] = [];
    for (const question of questions) {
      const option = question.options.find((o) => o.key === answers[question.key]);
      if (!option) continue;
      price = price * option.priceMultiplier + option.priceAdd;
      weeks += option.timelineAddWeeks;
      answerLabels.push(option.label);
    }
    const spread = settings.quoteSettings.rangeSpreadPercent / 100;
    const roundTo = settings.quoteSettings.roundTo || 1;
    const round = (value: number) => Math.round(value / roundTo) * roundTo;
    return {
      low: round(price * (1 - spread)),
      high: round(price * (1 + spread)),
      weeks: Math.max(1, Math.round(weeks)),
      answerLabels,
    };
  }, [service, answers, questions, settings.quoteSettings]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
    [locale],
  );

  useEffect(() => {
    if (formState.status === "success") {
      track("quote_submit", { service: serviceKey ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.status]);

  if (settings.services.length === 0) return null;

  const priceRangeText = estimate ? `${currency.format(estimate.low)} - ${currency.format(estimate.high)}` : "";
  const timelineText = estimate ? t("result.weeks", { count: estimate.weeks }) : "";

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-background-elevated p-6 sm:p-10">
      {phase !== "result" || formState.status !== "success" ? (
        <div className="mb-6 flex items-center justify-between">
          {phase !== "service" ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 font-mono text-sm text-foreground-muted transition-colors hover:text-brand"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              {t("back")}
            </button>
          ) : (
            <p className="font-mono text-sm text-foreground-muted tracking-tight">Compila il form</p>
          )}
          <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
            {t("stepOf", { current: currentStepNumber, total: totalSteps })}
          </p>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {phase === "service" && (
          <motion.div
            key="service"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <h3 className="text-lg font-semibold text-foreground">{t("chooseService")}</h3>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {settings.services.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  data-selected={s.key === serviceKey}
                  onClick={() => selectService(s.key)}
                  className={cardClass}
                >
                  <p className="font-medium">{s.name}</p>
                  {s.description && (
                    <p className="mt-1 text-xs text-foreground-muted">{s.description}</p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "question" &&
          (() => {
            const question = questions[questionIndex];
            if (!question) return null;
            return (
              <motion.div
                key={question.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                <h3 className="text-lg font-semibold text-foreground">{question.label}</h3>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      data-selected={answers[question.key] === option.key}
                      onClick={() => selectAnswer(question.key, option.key)}
                      className={cardClass}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })()}

        {phase === "result" && estimate && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            {formState.status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="size-10 text-brand" aria-hidden />
                <p className="text-lg font-semibold text-foreground">{t("form.success.title")}</p>
                <p className="text-sm text-foreground-muted">{t("form.success.text")}</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-foreground">
                  {settings.quoteSettings.resultTitle ?? t("result.priceLabel")}
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-5 text-center">
                    <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                      {t("result.priceLabel")}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-brand">{priceRangeText}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-5 text-center">
                    <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                      {t("result.timelineLabel")}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{timelineText}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-foreground-muted">
                  {settings.quoteSettings.resultDisclaimer ?? t("result.disclaimerFallback")}
                </p>

                <form action={formAction} className="mt-8 border-t border-dashed border-border pt-6">
                  <h4 className="text-base font-semibold text-foreground">{t("form.title")}</h4>
                  <p className="mt-1 text-sm text-foreground-muted">{t("form.text")}</p>

                  <input type="hidden" name="serviceName" value={service?.name ?? ""} />
                  <input type="hidden" name="answersSummary" value={estimate.answerLabels.join(", ")} />
                  <input type="hidden" name="priceRange" value={priceRangeText} />
                  <input type="hidden" name="timeline" value={timelineText} />
                  {/* Honeypot — nascosto agli utenti, non ai bot. */}
                  <div aria-hidden className="absolute left-[-9999px]">
                    <label htmlFor="quote-company">Azienda</label>
                    <input id="quote-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <label htmlFor="quote-name" className="sr-only">
                        {t("form.name")}
                      </label>
                      <input
                        id="quote-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder={t("form.name")}
                        aria-invalid={formState.fieldErrors?.name ? true : undefined}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="quote-contact" className="sr-only">
                        {t("form.contact")}
                      </label>
                      <input
                        id="quote-contact"
                        name="contact"
                        type="text"
                        required
                        placeholder={t("form.contactPlaceholder")}
                        aria-invalid={formState.fieldErrors?.contact ? true : undefined}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label htmlFor="quote-message" className="sr-only">
                      {t("form.message")}
                    </label>
                    <textarea
                      id="quote-message"
                      name="message"
                      rows={3}
                      placeholder={t("form.messagePlaceholder")}
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <SubmitButton label={t("form.submit")} pendingLabel={t("form.submitting")} />
                    <button
                      type="button"
                      onClick={restart}
                      className="font-mono text-xs text-foreground-muted transition-colors hover:text-brand"
                    >
                      {t("restart")}
                    </button>
                  </div>

                  {formState.status === "error" && (
                    <p role="alert" className="mt-4 text-sm text-destructive">
                      {formState.message ?? t("form.genericError")}
                    </p>
                  )}
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
