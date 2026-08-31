/**
 * Normalizzazione del referto di PageSpeed Insights.
 *
 * Lighthouse restituisce ~150 audit pensati per sviluppatori. Il pubblico di
 * `/analisi` non lo è: qui teniamo solo le poche voci che un imprenditore può
 * capire e su cui può decidere qualcosa, e le riduciamo a chiavi di traduzione.
 * Tutto il gergo (LCP, render-blocking, CLS…) muore in questo file: da qui in
 * poi circolano solo `key`, `grade` e numeri già formattati.
 */

export type Grade = "good" | "average" | "poor";

/** Le quattro categorie Lighthouse, rinominate in ciò che significano per un cliente. */
export const CATEGORY_KEYS = ["speed", "google", "everyone", "care"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** id della categoria Lighthouse → nostra chiave. */
const CATEGORY_MAP: Record<string, CategoryKey> = {
  performance: "speed",
  seo: "google",
  accessibility: "everyone",
  "best-practices": "care",
};

export type CategoryScore = {
  key: CategoryKey;
  /** 0-100 */
  score: number;
  grade: Grade;
};

export const METRIC_KEYS = ["loadTime", "stability", "responsiveness"] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

export type Metric = {
  key: MetricKey;
  /** Già formattato per la lingua richiesta, es. "3,4 s". */
  display: string;
  grade: Grade;
};

export type Finding = {
  /** Chiave sotto `analyze.findings` nei file messages. */
  key: string;
  grade: Exclude<Grade, "good">;
};

export type AnalysisReport = {
  /** URL effettivamente analizzato (dopo eventuali redirect). */
  url: string;
  /** Solo host, per i titoli: "ristorantedaluigi.it". */
  host: string;
  analyzedAt: string;
  /** 0-100, media pesata delle categorie. */
  overall: number;
  /** Colore e lettura del numero grande. */
  overallGrade: Grade;
  /**
   * Il giudizio a parole, che può essere più severo del numero: vedi
   * `verdictGrade()`.
   */
  verdict: Grade;
  scores: CategoryScore[];
  metrics: Metric[];
  findings: Finding[];
  /** Chiavi di `analyze.wins`: le cose che già funzionano. */
  wins: string[];
  /** true = misure raccolte da utenti reali (CrUX), false = simulazione. */
  fieldData: boolean;
  /** data URI dello screenshot mobile, se Lighthouse l'ha prodotto. */
  screenshot?: string;
};

/* -------------------------------------------------------------------------- */
/* Soglie                                                                      */
/* -------------------------------------------------------------------------- */

/** Le stesse soglie che usa Google, così il nostro voto non contraddice il suo. */
const SCORE_THRESHOLDS = { good: 90, average: 50 };

function gradeFromScore(score: number): Grade {
  if (score >= SCORE_THRESHOLDS.good) return "good";
  if (score >= SCORE_THRESHOLDS.average) return "average";
  return "poor";
}

/** [limite "buono", limite "da migliorare"] — oltre il secondo è "poor". */
const METRIC_THRESHOLDS: Record<MetricKey, [number, number]> = {
  loadTime: [2500, 4000], // LCP, ms
  stability: [0.1, 0.25], // CLS, adimensionale
  responsiveness: [200, 600], // TBT, ms
};

function gradeFromMetric(key: MetricKey, value: number): Grade {
  const [good, average] = METRIC_THRESHOLDS[key];
  if (value <= good) return "good";
  if (value <= average) return "average";
  return "poor";
}

const GRADE_ORDER: Grade[] = ["poor", "average", "good"];

/**
 * Il titolo del referto è la frase che la persona ricorda, e non può essere
 * più ottimista di quello che sente usando il sito. Un sito lento prende un
 * voto medio decente appena SEO e accessibilità sono a posto — ma se ci mette
 * sei secondi ad apparire, "funziona bene" è falso. Quindi il giudizio a
 * parole non può mai superare il voto della velocità, anche quando il numero
 * grande sarebbe più generoso.
 */
function verdictGrade(overall: Grade, speed: Grade | undefined): Grade {
  if (!speed) return overall;
  return GRADE_ORDER.indexOf(speed) < GRADE_ORDER.indexOf(overall) ? speed : overall;
}

/**
 * Peso di ogni categoria nel voto complessivo. La velocità pesa il doppio del
 * resto perché è l'unica cosa che il visitatore percepisce entro due secondi,
 * ed è quella che vendiamo.
 */
const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  speed: 2,
  google: 1.5,
  everyone: 1,
  care: 1,
};

/* -------------------------------------------------------------------------- */
/* Catalogo degli audit che mostriamo                                          */
/* -------------------------------------------------------------------------- */

type CatalogEntry = {
  /** Chiave sotto `analyze.findings`. */
  key: string;
  /** Ordine di gravità: più alto = mostrato prima. */
  weight: number;
  /**
   * Audit diversi che descrivono lo stesso problema per un non addetto
   * ("le immagini pesano troppo"): ne mostriamo uno solo.
   */
  group?: string;
};

/**
 * Solo audit il cui fallimento si può spiegare in una frase a chi non
 * programma. Tutto ciò che richiederebbe un paragrafo di contesto (CSP, terze
 * parti, source map, isolamento dell'origine…) resta fuori: in un referto per
 * un ristoratore è rumore, non informazione.
 *
 * Verificato contro Lighthouse 13.4.1 (agosto 2026). ATTENZIONE: Lighthouse
 * rinomina e ritira audit a ogni major — in 12 le "opportunità" di performance
 * sono diventate audit `*-insight`, e i vecchi id (`render-blocking-resources`,
 * `uses-optimized-images`, `viewport`…) sono spariti. Un id che non esiste più
 * non dà errore: semplicemente non trova mai niente, e il referto si svuota
 * senza che nessuno se ne accorga. Per questo `buildReport` avvisa in console
 * quando in sviluppo un id del catalogo manca dalla risposta: se compare quel
 * warning, i nomi vanno riallineati qui.
 */
const AUDIT_CATALOG: Record<string, CatalogEntry> = {
  // — Sicurezza e struttura: i problemi che costano di più —
  "is-on-https": { key: "https", weight: 100 },
  "viewport-insight": { key: "viewport", weight: 95 },
  "is-crawlable": { key: "blockedFromGoogle", weight: 90 },
  "http-status-code": { key: "httpStatus", weight: 85 },

  // — Come appari su Google —
  "document-title": { key: "title", weight: 70 },
  "meta-description": { key: "description", weight: 68 },
  canonical: { key: "canonical", weight: 45 },
  "robots-txt": { key: "robotsTxt", weight: 44 },
  "crawlable-anchors": { key: "crawlableLinks", weight: 42 },
  "link-text": { key: "linkText", weight: 40 },

  // — Velocità —
  // `document-latency-insight` ingloba tempo di risposta, redirect e
  // compressione: quando c'è, dice la stessa cosa di server-response-time.
  "document-latency-insight": { key: "slowServer", weight: 66, group: "server" },
  "server-response-time": { key: "slowServer", weight: 65, group: "server" },
  "total-byte-weight": { key: "heavyPage", weight: 64 },
  "image-delivery-insight": { key: "heavyImages", weight: 62 },
  "render-blocking-insight": { key: "blockingResources", weight: 58 },
  "unsized-images": { key: "unsizedImages", weight: 53 },
  "unused-javascript": { key: "unusedCode", weight: 50, group: "unused" },
  "unused-css-rules": { key: "unusedCode", weight: 49, group: "unused" },
  "legacy-javascript-insight": { key: "unusedCode", weight: 48, group: "unused" },
  "duplicated-javascript-insight": { key: "unusedCode", weight: 47, group: "unused" },
  "unminified-javascript": { key: "unusedCode", weight: 46, group: "unused" },
  "unminified-css": { key: "unusedCode", weight: 45, group: "unused" },
  "font-display-insight": { key: "invisibleText", weight: 41 },
  // Basso di proposito: quasi ogni sito fa almeno un salto (http→https,
  // dominio→www), quindi ad alto peso occuperebbe uno dei cinque slot in ogni
  // referto, scalzando problemi che costano molto di più. Vale la pena dirlo,
  // non vale la pena metterlo in cima.
  redirects: { key: "redirects", weight: 39 },

  // — Leggibilità e uso da telefono —
  "color-contrast": { key: "contrast", weight: 54 },
  "target-size": { key: "smallTargets", weight: 52 },
  "image-alt": { key: "imageAlt", weight: 44 },
  label: { key: "formLabels", weight: 43 },
  "link-name": { key: "namelessControls", weight: 38, group: "names" },
  "button-name": { key: "namelessControls", weight: 37, group: "names" },
  "html-has-lang": { key: "language", weight: 30 },
  "heading-order": { key: "headingOrder", weight: 28 },

  // — Cura tecnica —
  "errors-in-console": { key: "consoleErrors", weight: 34 },
  "image-aspect-ratio": { key: "stretchedImages", weight: 32, group: "aspect" },
  "image-size-responsive": { key: "stretchedImages", weight: 31, group: "aspect" },
  deprecations: { key: "outdatedCode", weight: 26 },
};

/**
 * Audit che, quando passano, vale la pena rimarcare. Un referto fatto solo di
 * problemi si legge come una vendita aggressiva e chi lo riceve smette di
 * fidarsi: queste sono le due o tre righe che dicono "questo lo fai già bene".
 */
const WIN_CATALOG: Record<string, string> = {
  "is-on-https": "https",
  "viewport-insight": "mobile",
  "document-title": "title",
  "meta-description": "description",
  "is-crawlable": "crawlable",
  "image-alt": "imageAlt",
  "color-contrast": "contrast",
  "target-size": "targets",
  "server-response-time": "fastServer",
};

/* -------------------------------------------------------------------------- */
/* Tipi minimi della risposta PSI (solo i campi che leggiamo davvero)          */
/* -------------------------------------------------------------------------- */

type PsiAudit = {
  id?: string;
  score?: number | null;
  scoreDisplayMode?: string;
  numericValue?: number;
  details?: { data?: string } & Record<string, unknown>;
};

export type PsiResponse = {
  lighthouseResult?: {
    requestedUrl?: string;
    finalUrl?: string;
    finalDisplayedUrl?: string;
    categories?: Record<string, { id?: string; score?: number | null }>;
    audits?: Record<string, PsiAudit>;
  };
  loadingExperience?: {
    metrics?: Record<string, { percentile?: number; category?: string }>;
  };
};

/* -------------------------------------------------------------------------- */
/* Normalizzazione                                                             */
/* -------------------------------------------------------------------------- */

function formatSeconds(ms: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(ms / 1000);
}

function formatDecimal(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Un audit conta come fallito se Lighthouse gli ha dato un punteggio e questo
 * sta sotto 0.9. `scoreDisplayMode` "notApplicable"/"informative"/"manual"
 * significa che non è stato valutato: ignorarli evita di segnalare problemi
 * che non esistono.
 */
function isFailing(audit: PsiAudit | undefined): boolean {
  if (!audit || typeof audit.score !== "number") return false;
  if (audit.scoreDisplayMode === "informative" || audit.scoreDisplayMode === "manual") {
    return false;
  }
  return audit.score < 0.9;
}

function isPassing(audit: PsiAudit | undefined): boolean {
  return typeof audit?.score === "number" && audit.score >= 0.9;
}

/**
 * In sviluppo, avvisa se il catalogo nomina audit che Lighthouse non manda
 * più. È l'unico modo di accorgersi di un rename: un id morto non produce
 * errori, produce silenzio.
 */
function warnAboutStaleAuditIds(audits: Record<string, PsiAudit>) {
  if (process.env.NODE_ENV === "production") return;
  // Una risposta PSI completa porta ~150 audit. Sotto quella soglia siamo
  // davanti a una risposta parziale (un test, una sola categoria richiesta) e
  // gli id "mancanti" non dicono niente: avvisare lì renderebbe il warning
  // rumore, e un warning che grida sempre non lo legge più nessuno.
  if (Object.keys(audits).length < 100) return;
  const stale = [...Object.keys(AUDIT_CATALOG), ...Object.keys(WIN_CATALOG)].filter(
    (id) => !(id in audits),
  );
  if (stale.length > 0) {
    console.warn(
      "[analisi] Lighthouse non restituisce più questi audit: " +
        `${[...new Set(stale)].join(", ")}. ` +
        "Vanno riallineati in lib/analysis/report.ts, altrimenti il referto perde pezzi.",
    );
  }
}

export function buildReport(psi: PsiResponse, locale: string): AnalysisReport | null {
  const lighthouse = psi.lighthouseResult;
  const audits = lighthouse?.audits;
  if (!lighthouse || !audits) return null;

  warnAboutStaleAuditIds(audits);

  const finalUrl =
    lighthouse.finalDisplayedUrl || lighthouse.finalUrl || lighthouse.requestedUrl || "";

  /* Categorie */
  const scores: CategoryScore[] = [];
  for (const [lighthouseId, key] of Object.entries(CATEGORY_MAP)) {
    const raw = lighthouse.categories?.[lighthouseId]?.score;
    if (typeof raw !== "number") continue;
    const score = Math.round(raw * 100);
    scores.push({ key, score, grade: gradeFromScore(score) });
  }
  if (scores.length === 0) return null;

  const weighted = scores.reduce(
    (acc, { key, score }) => {
      const weight = CATEGORY_WEIGHTS[key];
      return { sum: acc.sum + score * weight, weight: acc.weight + weight };
    },
    { sum: 0, weight: 0 },
  );
  const overall = Math.round(weighted.sum / weighted.weight);

  /* Metriche percepite dal visitatore.
     Preferiamo i dati di campo (CrUX: utenti veri degli ultimi 28 giorni) al
     laboratorio, ma CrUX esiste solo per i siti con abbastanza traffico —
     quindi ricadiamo sui numeri simulati e lo dichiariamo nel referto. */
  const field = psi.loadingExperience?.metrics;
  const fieldLcp = field?.LARGEST_CONTENTFUL_PAINT_MS?.percentile;
  const fieldCls = field?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile;
  const fieldData = typeof fieldLcp === "number";

  const lcp = fieldData ? fieldLcp : audits["largest-contentful-paint"]?.numericValue;
  // CrUX esprime il CLS in centesimi (12 = 0,12), Lighthouse come numero puro.
  const cls =
    fieldData && typeof fieldCls === "number"
      ? fieldCls / 100
      : audits["cumulative-layout-shift"]?.numericValue;
  const tbt = audits["total-blocking-time"]?.numericValue;

  const metrics: Metric[] = [];
  if (typeof lcp === "number") {
    metrics.push({
      key: "loadTime",
      display: `${formatSeconds(lcp, locale)} s`,
      grade: gradeFromMetric("loadTime", lcp),
    });
  }
  if (typeof cls === "number") {
    metrics.push({
      key: "stability",
      display: formatDecimal(cls, locale),
      grade: gradeFromMetric("stability", cls),
    });
  }
  if (typeof tbt === "number") {
    metrics.push({
      key: "responsiveness",
      display: `${formatSeconds(tbt, locale)} s`,
      grade: gradeFromMetric("responsiveness", tbt),
    });
  }

  /* Problemi trovati: al massimo uno per gruppo, i cinque più gravi. */
  const seenGroups = new Set<string>();
  const findings: Finding[] = [];
  const candidates = Object.entries(AUDIT_CATALOG)
    .filter(([auditId]) => isFailing(audits[auditId]))
    .sort((a, b) => b[1].weight - a[1].weight);

  for (const [auditId, entry] of candidates) {
    if (entry.group && seenGroups.has(entry.group)) continue;
    if (entry.group) seenGroups.add(entry.group);
    if (findings.some((f) => f.key === entry.key)) continue;

    const score = audits[auditId]?.score ?? 0;
    findings.push({ key: entry.key, grade: score < 0.5 ? "poor" : "average" });
    if (findings.length === 5) break;
  }

  /* Cose che già funzionano: tre, per non trasformare il referto in una lista
     di colpe. */
  const wins: string[] = [];
  for (const [auditId, winKey] of Object.entries(WIN_CATALOG)) {
    if (wins.length === 3) break;
    if (isPassing(audits[auditId]) && !wins.includes(winKey)) wins.push(winKey);
  }

  const screenshot = audits["final-screenshot"]?.details?.data;

  let host = finalUrl;
  try {
    host = new URL(finalUrl).host.replace(/^www\./, "");
  } catch {
    /* finalUrl arriva già validato dall'action; se non lo fosse, mostriamo il grezzo. */
  }

  return {
    url: finalUrl,
    host,
    analyzedAt: new Date().toISOString(),
    overall,
    overallGrade: gradeFromScore(overall),
    verdict: verdictGrade(
      gradeFromScore(overall),
      scores.find((s) => s.key === "speed")?.grade,
    ),
    scores,
    metrics,
    findings,
    wins,
    fieldData,
    screenshot: typeof screenshot === "string" ? screenshot : undefined,
  };
}
