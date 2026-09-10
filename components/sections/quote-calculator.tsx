"use client";

import { useEffect, useMemo, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, animate, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Calculator, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { track } from "@vercel/analytics";
import { submitQuoteForm, type QuoteFormState } from "@/lib/actions/quote";
import { cn } from "@/lib/utils";
import type { PricingSettings } from "@/sanity/types";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const initialState: QuoteFormState = { status: "idle" };

type Phase = "service" | "question" | "result";

const cardClass =
  "group relative w-full rounded-lg border border-border bg-background-elevated p-4 pr-11 text-left text-sm text-foreground shadow-[var(--shadow-sm)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-md)] active:translate-y-0 active:scale-[0.98] data-[selected=true]:border-brand data-[selected=true]:bg-brand-subtle data-[selected=true]:shadow-[var(--shadow-md)]";

const inputClass =
  "w-full rounded-lg border border-border bg-background-elevated px-3.5 py-3 text-base text-foreground placeholder:text-foreground-muted outline-none transition-colors focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 aria-invalid:border-destructive";

/** Pallino radio nell'angolo di ogni card — l'unico feedback di selezione, niente icone extra. */
function SelectionDot() {
  return (
    <span
      aria-hidden
      className="absolute top-4 right-4 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border transition-colors duration-200 group-hover:border-brand/50 group-data-[selected=true]:border-brand"
    >
      <span className="size-2 rounded-full bg-brand opacity-0 transition-opacity duration-200 group-data-[selected=true]:opacity-100" />
    </span>
  );
}

/** Conta da 0 al valore target quando `active` diventa true — il prezzo si "calcola" a video. */
function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const controls = animate(0, target, {
      duration: 0.9,
      ease: EASE_OUT,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [target, active]);
  return active ? value : 0;
}

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
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  // Sposta il focus sul risultato quando arriva — sia il preventivo sia la
  // conferma d'invio, così chi naviga da tastiera o con un lettore vocale non
  // resta fermo sulla domanda precedente mentre il contenuto sotto cambia.
  useEffect(() => {
    if (phase === "result") resultHeadingRef.current?.focus();
  }, [phase, formState.status]);

  const questions = settings.quoteQuestions;
  const service = settings.services.find((s) => s.key === serviceKey) ?? null;
  const totalSteps = questions.length + 1;
  const currentStepNumber =
    phase === "service" ? 1 : phase === "question" ? questionIndex + 2 : totalSteps;
  const showingResultForm = phase === "result" && formState.status !== "success";

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

  function jumpToService() {
    setPhase("service");
  }

  function jumpToQuestion(index: number) {
    setQuestionIndex(index);
    setPhase("question");
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

  const priceActive = showingResultForm && estimate !== null;
  const animatedLow = useCountUp(estimate?.low ?? 0, priceActive);
  const animatedHigh = useCountUp(estimate?.high ?? 0, priceActive);

  useEffect(() => {
    if (formState.status === "success") {
      track("quote_submit", { service: serviceKey ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.status]);

  const breadcrumbs = useMemo(() => {
    const trail: { label: string; onClick: () => void }[] = [];
    if (service) trail.push({ label: service.name, onClick: jumpToService });
    questions.forEach((question, index) => {
      if (index >= questionIndex && phase !== "result") return;
      const option = question.options.find((o) => o.key === answers[question.key]);
      if (option) trail.push({ label: option.label, onClick: () => jumpToQuestion(index) });
    });
    return trail;
  }, [service, questions, answers, questionIndex, phase]);

  if (settings.services.length === 0) return null;

  const priceRangeText = estimate ? `${currency.format(estimate.low)} - ${currency.format(estimate.high)}` : "";
  const timelineText = estimate ? t("result.weeks", { count: estimate.weeks }) : "";

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-background-elevated p-6 sm:p-10">
      {!(phase === "result" && formState.status === "success") ? (
        <div className="mb-7">
          <div className="flex items-center justify-between gap-4">
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
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-brand/25 bg-accent-brand/10 px-3 py-1 font-mono text-xs tracking-wider text-foreground uppercase">
                <Calculator className="size-3.5" aria-hidden />
                {t("eyebrow")}
              </p>
            )}
            <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
              {t("stepOf", { current: currentStepNumber, total: totalSteps })}
            </p>
          </div>

          <div className="mt-4 flex gap-1.5" aria-hidden>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full bg-border transition-colors duration-300",
                  index < currentStepNumber && "bg-brand",
                )}
              />
            ))}
          </div>

          {breadcrumbs.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1">
                  {index > 0 && <span className="text-xs text-foreground-muted/40">/</span>}
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="max-w-32 truncate rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-foreground-muted transition-colors hover:border-brand hover:text-brand"
                  >
                    {crumb.label}
                  </button>
                </span>
              ))}
            </div>
          )}
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
                  <SelectionDot />
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
                      <SelectionDot />
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
              <div role="status" className="flex flex-col items-center gap-3 py-6 text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <CheckCircle2 className="size-12 text-brand" aria-hidden />
                </motion.div>
                <h3
                  ref={resultHeadingRef}
                  tabIndex={-1}
                  className="text-lg font-semibold text-foreground outline-none"
                >
                  {t("form.success.title")}
                </h3>
                <p className="text-sm text-foreground-muted">{t("form.success.text")}</p>
                <button
                  type="button"
                  onClick={restart}
                  className="mt-2 font-mono text-xs text-foreground-muted transition-colors hover:text-brand"
                >
                  {t("restart")}
                </button>
              </div>
            ) : (
              <>
                <h3
                  ref={resultHeadingRef}
                  tabIndex={-1}
                  className="text-lg font-semibold text-foreground outline-none"
                >
                  {settings.quoteSettings.resultTitle ?? t("result.priceLabel")}
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border-2 border-brand/25 bg-brand-subtle/40 p-5 text-center">
                    <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                      {t("result.priceLabel")}
                    </p>
                    <p className="mt-2 font-mono text-xl font-bold tracking-tight text-brand sm:text-2xl">
                      {currency.format(Math.round(animatedLow))} - {currency.format(Math.round(animatedHigh))}{" "}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-5 text-center">
                    <p className="font-mono text-xs uppercase tracking-wide text-foreground-muted">
                      {t("result.timelineLabel")}
                    </p>
                    <p className="mt-2 flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                      <Clock className="size-5 text-foreground-muted" aria-hidden />
                      {timelineText}
                    </p>
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
