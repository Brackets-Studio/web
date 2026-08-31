"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Check,
  Loader2,
  Search,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { analyzeSite, type AnalyzeFormState } from "@/lib/actions/analyze";
import type { AnalysisReport, CategoryKey, Grade, MetricKey } from "@/lib/analysis/report";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * I tre voti hanno bisogno di un colore che significhi qualcosa, e il brand
 * (arancione) qui non può servire: marca le CTA, e usarlo anche per "buono"
 * renderebbe impossibile capire dove si clicca. Quindi verde/ambra/rosso, in
 * tinte che superano il contrasto AA su entrambi i temi.
 */
const GRADE_STYLE: Record<
  Grade,
  { text: string; bg: string; border: string; stroke: string; bar: string }
> = {
  good: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-600/25 dark:border-emerald-400/25",
    stroke: "stroke-emerald-600 dark:stroke-emerald-400",
    bar: "bg-emerald-600 dark:bg-emerald-400",
  },
  average: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-600/25 dark:border-amber-400/25",
    stroke: "stroke-amber-600 dark:stroke-amber-400",
    bar: "bg-amber-600 dark:bg-amber-400",
  },
  poor: {
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-600/25 dark:border-red-400/25",
    stroke: "stroke-red-600 dark:stroke-red-400",
    bar: "bg-red-600 dark:bg-red-400",
  },
};

const GRADE_ICON: Record<Grade, typeof Check> = {
  good: Check,
  average: TriangleAlert,
  poor: XCircle,
};

const initialState: AnalyzeFormState = { status: "idle" };

/* -------------------------------------------------------------------------- */
/* Modulo                                                                      */
/* -------------------------------------------------------------------------- */

export function SiteAnalyzer({ initialUrl }: { initialUrl?: string }) {
  const t = useTranslations("analyze");
  const [state, formAction, isPending] = useActionState(analyzeSite, initialState);

  /* Chi arriva dal campo in homepage ha già premuto invio una volta: l'analisi
     parte da sola, senza fargliela chiedere due volte. Il ref impedisce che il
     doppio montaggio di React in sviluppo la faccia partire due volte, e quindi
     che bruci il doppio della quota PageSpeed. */
  const formRef = useRef<HTMLFormElement>(null);
  const autoStarted = useRef(false);

  useEffect(() => {
    if (!initialUrl || autoStarted.current) return;
    autoStarted.current = true;
    formRef.current?.requestSubmit();
  }, [initialUrl]);

  return (
    <div className="flex flex-col gap-16">
      <form ref={formRef} action={formAction} className="mx-auto w-full max-w-xl">
        {/* Honeypot: fuori schermo invece che display:none, così i bot che
            saltano i campi nascosti lo compilano comunque. */}
        <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <label htmlFor="url" className="sr-only">
          {t("form.label")}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground-muted"
              aria-hidden
            />
            <input
              id="url"
              name="url"
              type="text"
              inputMode="url"
              required
              autoComplete="url"
              spellCheck={false}
              disabled={isPending}
              defaultValue={initialUrl}
              placeholder={t("form.placeholder")}
              className="w-full rounded-pill border border-border bg-background-elevated py-3.5 pr-4 pl-11 text-base text-foreground outline-none transition-colors placeholder:text-foreground-muted focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/20 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-pill bg-brand px-7 py-3.5 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {isPending ? t("form.submitting") : t("form.submit")}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-foreground-muted">{t("form.hint")}</p>
      </form>

      <AnimatePresence mode="wait">
        {isPending && <LoadingPanel key="loading" />}

        {!isPending && state.status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            role="alert"
            className="mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-border bg-background-elevated p-5"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <p className="text-sm text-foreground">{t(`errors.${state.error}`)}</p>
          </motion.div>
        )}

        {!isPending && state.status === "success" && (
          <ReportView key={state.report.url + state.report.analyzedAt} report={state.report} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Attesa                                                                      */
/* -------------------------------------------------------------------------- */

/** Lighthouse impiega 30-60 s: un semplice spinner, a quella durata, si legge
 *  come "si è rotto". Raccontare cosa sta succedendo, passo per passo, tiene
 *  la persona sulla pagina. */
function LoadingPanel() {
  const t = useTranslations("analyze");
  const steps = t.raw("loading.steps") as string[];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }, 7000);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="mx-auto w-full max-w-xl rounded-3xl border border-border bg-background-elevated p-8"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-foreground">{t("loading.title")}</p>

      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        {/* Avanzamento onesto quanto può esserlo: PSI non espone progresso, così
            la barra si avvicina al 95% senza mai arrivarci finché non c'è il dato. */}
        <motion.div
          initial={{ width: "4%" }}
          animate={{ width: "95%" }}
          transition={{ duration: 55, ease: "easeOut" }}
          className="h-full rounded-full bg-brand"
        />
      </div>

      <div className="mt-5 h-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="text-sm text-foreground-muted"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Referto                                                                     */
/* -------------------------------------------------------------------------- */

function ReportView({ report }: { report: AnalysisReport }) {
  const t = useTranslations("analyze");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="flex flex-col gap-14"
    >
      {/* Verdetto */}
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[auto_1fr]">
        <ScoreDial score={report.overall} grade={report.overallGrade} label={t("result.overallLabel")} />

        <div>
          <p className="font-mono text-xs tracking-wider text-foreground-muted uppercase">
            {report.host}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            {t(`result.verdict.${report.verdict}.title`)}
          </h2>
          <p className="mt-3 max-w-lg text-foreground-muted">
            {t(`result.verdict.${report.verdict}.body`)}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground-muted">
            <span className="size-1.5 shrink-0 rounded-full bg-brand" />
            {t(report.fieldData ? "result.dataSource.field" : "result.dataSource.lab")}
          </p>
        </div>
      </div>

      {/* Cosa vede il visitatore, con lo screenshot vero accanto ai numeri */}
      {(report.metrics.length > 0 || report.screenshot) && (
        <section>
          <h3 className="text-xl font-semibold text-foreground">{t("result.metricsTitle")}</h3>
          <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
            {t("result.metricsSubtitle")}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
            {report.screenshot && (
              <figure className="mx-auto lg:mx-0">
                <div className="relative w-52 overflow-hidden rounded-[2.25rem] border border-border bg-background-elevated p-2 shadow-md">
                  {/* Data URI restituito da Lighthouse: next/image non lo
                      ottimizzerebbe comunque, e non ne conosciamo le dimensioni. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.screenshot}
                    alt={t("result.screenshotAlt", { host: report.host })}
                    className="w-full rounded-[1.75rem] object-cover object-top"
                  />
                  <span
                    aria-hidden
                    className="absolute top-4 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-border"
                  />
                </div>
                <figcaption className="mt-3 text-center text-xs text-foreground-muted">
                  {t("result.screenshotCaption")}
                </figcaption>
              </figure>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {report.metrics.map((metric) => (
                <MetricCard
                  key={metric.key}
                  metricKey={metric.key}
                  display={metric.display}
                  grade={metric.grade}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Le quattro pagelle */}
      <section>
        <h3 className="text-xl font-semibold text-foreground">{t("result.categoriesTitle")}</h3>
        <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
          {t("result.categoriesSubtitle")}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {report.scores.map((score, index) => (
            <CategoryRow
              key={score.key}
              categoryKey={score.key}
              score={score.score}
              grade={score.grade}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Problemi */}
      <section>
        <h3 className="text-xl font-semibold text-foreground">{t("result.findingsTitle")}</h3>
        <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
          {t("result.findingsSubtitle")}
        </p>

        {report.findings.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border bg-background-elevated p-6 text-sm text-foreground-muted">
            {t("result.noFindings")}
          </p>
        ) : (
          <ol className="mt-6 flex flex-col gap-3">
            {report.findings.map((finding, index) => {
              const style = GRADE_STYLE[finding.grade];
              const Icon = GRADE_ICON[finding.grade];
              return (
                <motion.li
                  key={finding.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06, ease: EASE_OUT }}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-background-elevated p-5"
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border",
                      style.bg,
                      style.border,
                    )}
                  >
                    <Icon className={cn("size-4", style.text)} aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      {t(`findings.${finding.key}.title`)}
                    </p>
                    <p className="mt-1 text-sm text-foreground-muted">
                      {t(`findings.${finding.key}.impact`)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Cose che già funzionano — un referto di sole colpe non si crede */}
      {report.wins.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-foreground">{t("result.winsTitle")}</h3>
          <ul className="mt-5 flex flex-col gap-2.5">
            {report.wins.map((win) => (
              <li key={win} className="flex items-start gap-3 text-sm text-foreground-muted">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2.5}
                  aria-hidden
                />
                {t(`wins.${win}`)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Richiesta */}
      <section className="rounded-3xl border border-border bg-background-elevated p-8 text-center sm:p-10">
        <h3 className="text-2xl font-semibold text-balance text-foreground">{t("cta.title")}</h3>
        <p className="mx-auto mt-3 max-w-lg text-foreground-muted">{t("cta.text")}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href={siteConfig.booking}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <CalendarClock className="size-4" aria-hidden />
            {t("cta.primary")}
          </a>
          <Link
            href="/#contatti"
            className="inline-flex items-center gap-2 rounded-pill border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60"
          >
            {t("cta.secondary")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <p className="text-center text-xs text-foreground-muted">{t("result.footnote")}</p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pezzi del referto                                                           */
/* -------------------------------------------------------------------------- */

const DIAL_RADIUS = 52;
const DIAL_CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS;

function ScoreDial({ score, grade, label }: { score: number; grade: Grade; label: string }) {
  const style = GRADE_STYLE[grade];

  return (
    <div className="mx-auto flex flex-col items-center md:mx-0">
      <div className="relative">
        <svg width="136" height="136" viewBox="0 0 136 136" role="img" aria-label={`${label}: ${score}/100`}>
          <circle
            cx="68"
            cy="68"
            r={DIAL_RADIUS}
            fill="none"
            strokeWidth="10"
            className="stroke-border"
          />
          <motion.circle
            cx="68"
            cy="68"
            r={DIAL_RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={style.stroke}
            strokeDasharray={DIAL_CIRCUMFERENCE}
            initial={{ strokeDashoffset: DIAL_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: DIAL_CIRCUMFERENCE * (1 - score / 100) }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
            transform="rotate(-90 68 68)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-mono text-4xl font-bold", style.text)}>{score}</span>
          <span className="font-mono text-xs text-foreground-muted">/100</span>
        </div>
      </div>
      <p className="mt-2 text-xs tracking-wider text-foreground-muted uppercase">{label}</p>
    </div>
  );
}

function MetricCard({
  metricKey,
  display,
  grade,
}: {
  metricKey: MetricKey;
  display: string;
  grade: Grade;
}) {
  const t = useTranslations("analyze.metrics");
  const style = GRADE_STYLE[grade];

  return (
    <div className={cn("rounded-2xl border p-5", style.border, style.bg)}>
      <p className="text-sm font-medium text-foreground">{t(`${metricKey}.label`)}</p>
      <p className={cn("mt-2 font-mono text-3xl font-bold", style.text)}>{display}</p>
      <p className="mt-3 text-sm text-foreground-muted">{t(`${metricKey}.${grade}`)}</p>
    </div>
  );
}

function CategoryRow({
  categoryKey,
  score,
  grade,
  index,
}: {
  categoryKey: CategoryKey;
  score: number;
  grade: Grade;
  index: number;
}) {
  const t = useTranslations("analyze");
  const style = GRADE_STYLE[grade];

  return (
    <div className="rounded-2xl border border-border bg-background-elevated p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium text-foreground">{t(`categories.${categoryKey}.label`)}</p>
        <p className={cn("font-mono text-sm font-bold", style.text)}>
          {score}
          <span className="text-foreground-muted">/100</span>
        </p>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.15 + index * 0.08, ease: EASE_OUT }}
          className={cn("h-full rounded-full", style.bar)}
        />
      </div>

      <p className="mt-3 text-sm text-foreground-muted">
        {t(`categories.${categoryKey}.what`)}
      </p>
      <p className={cn("mt-2 text-xs font-medium", style.text)}>{t(`grades.${grade}`)}</p>
    </div>
  );
}
