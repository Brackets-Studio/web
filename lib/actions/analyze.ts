"use server";

import { getLocale } from "next-intl/server";
import { z } from "zod";
import { buildReport, type AnalysisReport, type PsiResponse } from "@/lib/analysis/report";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

/** Lighthouse su rete mobile simulata richiede tranquillamente 30-60 s. */
const PSI_TIMEOUT_MS = 110_000;

const analyzeSchema = z.object({
  url: z.string().trim().min(1).max(2000),
  // Honeypot: gli umani non lo vedono, i bot lo riempiono.
  website: z.string().max(0).optional().or(z.literal("")),
});

/** Le chiavi vivono sotto `analyze.errors` nei file messages. */
export type AnalyzeErrorKey =
  | "invalidUrl"
  | "privateUrl"
  | "unreachable"
  | "rateLimited"
  | "notConfigured"
  | "generic";

export type AnalyzeFormState =
  | { status: "idle" }
  | { status: "error"; error: AnalyzeErrorKey }
  | { status: "success"; report: AnalysisReport };

/* Lo stato iniziale vive nel componente, non qui: un file "use server" può
   esportare solo funzioni async, e un oggetto costante fa fallire il modulo
   in fase di caricamento. I tipi invece spariscono in compilazione e possono
   restare. */

/**
 * Normalizza quello che scrive una persona reale ("miosito.it", "www.miosito.it",
 * un URL incollato con spazi) in un URL http(s) valido, e rifiuta tutto ciò che
 * non ha senso analizzare: indirizzi locali, IP privati, protocolli esotici.
 */
function normalizeUrl(input: string): { url: URL } | { error: AnalyzeErrorKey } {
  const trimmed = input.trim().replace(/\s+/g, "");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return { error: "invalidUrl" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return { error: "invalidUrl" };

  const host = url.hostname.toLowerCase();
  // Serve almeno un punto e un TLD plausibile: "pippo" non è un sito.
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return { error: "invalidUrl" };
  }

  const isPrivate =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (isPrivate) return { error: "privateUrl" };

  url.hash = "";
  return { url };
}

/**
 * Freno di emergenza, non un vero rate limiter: la memoria è per-istanza e su
 * Fluid Compute le istanze sono più d'una. Serve solo a impedire che una
 * singola scheda del browser bruci la quota giornaliera dell'API PageSpeed
 * tenendo premuto invio. Il limite vero, se servirà, va su Upstash/Redis.
 */
const recentRuns = new Map<string, number[]>();
const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 };

function tooManyRuns(key: string): boolean {
  const now = Date.now();
  const hits = (recentRuns.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (hits.length >= RATE_LIMIT.max) {
    recentRuns.set(key, hits);
    return true;
  }
  hits.push(now);
  recentRuns.set(key, hits);
  // La mappa non cresce all'infinito: sopra le 500 chiavi ributtiamo via tutto.
  if (recentRuns.size > 500) recentRuns.clear();
  return false;
}

export async function analyzeSite(
  _prevState: AnalyzeFormState,
  formData: FormData,
): Promise<AnalyzeFormState> {
  const parsed = analyzeSchema.safeParse({
    url: formData.get("url"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) return { status: "error", error: "invalidUrl" };
  // Honeypot scattato: rispondiamo come a un URL sbagliato, senza spendere quota.
  if (parsed.data.website) return { status: "error", error: "invalidUrl" };

  const normalized = normalizeUrl(parsed.data.url);
  if ("error" in normalized) return { status: "error", error: normalized.error };
  const target = normalized.url;

  if (tooManyRuns(target.host)) return { status: "error", error: "rateLimited" };

  const locale = await getLocale();
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    console.error("PAGESPEED_API_KEY non configurata: /analisi non può funzionare.");
    return { status: "error", error: "notConfigured" };
  }

  const endpoint = new URL(PSI_ENDPOINT);
  endpoint.searchParams.set("url", target.toString());
  // Mobile perché è da lì che arriva la maggior parte dei visitatori di questi
  // siti, ed è la condizione in cui i problemi si vedono.
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("locale", locale === "it" ? "it" : "en");
  endpoint.searchParams.set("key", apiKey);
  for (const category of ["performance", "seo", "accessibility", "best-practices"]) {
    endpoint.searchParams.append("category", category);
  }

  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(PSI_TIMEOUT_MS),
      // Un referto vecchio di un'ora va benissimo, e ci risparmia la quota
      // quando la stessa persona ricarica la pagina.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("PageSpeed Insights ha risposto con errore:", response.status, body);
      // 400/422 = Lighthouse non è riuscito a caricare la pagina (dominio
      // inesistente, sito giù, blocco anti-bot): è colpa dell'URL, non nostra.
      if (response.status === 400 || response.status === 422 || response.status === 500) {
        return { status: "error", error: "unreachable" };
      }
      if (response.status === 429) return { status: "error", error: "rateLimited" };
      // 401/403 = la chiave è assente, scaduta o ristretta (tipico: restrizione
      // per referrer HTTP, che da server non funziona mai perché il referrer
      // non c'è). Non è un problema del sito analizzato e riprovare non serve:
      // meritano il messaggio "fuori servizio, scrivici", non "riprova".
      if (response.status === 401 || response.status === 403) {
        return { status: "error", error: "notConfigured" };
      }
      return { status: "error", error: "generic" };
    }

    const psi = (await response.json()) as PsiResponse;
    const report = buildReport(psi, locale);
    if (!report) return { status: "error", error: "unreachable" };

    return { status: "success", report };
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      console.error("PageSpeed Insights: timeout su", target.toString());
      return { status: "error", error: "unreachable" };
    }
    console.error("Errore durante l'analisi del sito:", error);
    return { status: "error", error: "generic" };
  }
}
