import { getCliClient } from "sanity/cli";

/**
 * Crea il singleton "Impostazioni prezzi" (`pricingSettings`), collegato per
 * `reference` ai quattro Servizi creati da `002-servizi.ts`.
 *
 * Si esegue dalla cartella `studio/`:
 *
 *   npx sanity exec migrations/003-impostazioni-prezzi.ts --with-user-token
 *
 * Stesso avvertimento di `002-servizi.ts`: `sanity exec` non chiama un export
 * default, va tutto al livello più alto del modulo (dentro `run()`, invocata
 * subito sotto).
 *
 * Riempie solo i campi italiani. `basePrice`/`baseTimelineWeeks` sono numeri
 * di partenza plausibili, non un listino approvato: vanno rivisti a mano in
 * Studio prima di considerarli definitivi.
 *
 * Idempotente: rieseguirla riscrive lo stesso documento (`createOrReplace`
 * sull'`_id` fisso `pricingSettings`).
 */

type PricingServiceSeed = {
  serviceId: string;
  basePrice: number;
  baseTimelineWeeks: number;
  features: string[];
  order: number;
};

const PRICING_SERVICES: PricingServiceSeed[] = [
  {
    serviceId: "service-web",
    basePrice: 1500,
    baseTimelineWeeks: 3,
    features: [
      "Progettazione e contenuti insieme a te",
      "Pannello semplice per aggiornarlo da solo",
      "Dominio, hosting e primo anno inclusi",
    ],
    order: 1,
  },
  {
    serviceId: "service-mobile",
    basePrice: 4500,
    baseTimelineWeeks: 6,
    features: [
      "Una sola app per iPhone e Android",
      "Pubblicazione sugli store inclusa",
      "Collegata ai dati che hai già",
    ],
    order: 2,
  },
  {
    serviceId: "service-ai",
    basePrice: 3000,
    baseTimelineWeeks: 4,
    features: [
      "Lettura automatica di documenti",
      "Automazioni su misura",
      "Collegamenti ai programmi che usi già",
    ],
    order: 3,
  },
  {
    serviceId: "service-cloud",
    basePrice: 2000,
    baseTimelineWeeks: 3,
    features: [
      "Server monitorati, con backup",
      "Collegamento a WhatsApp Business o centralino",
      "Nessuna manutenzione a carico tuo",
    ],
    order: 4,
  },
];

type QuoteOptionSeed = {
  key: string;
  label: string;
  priceMultiplier: number;
  priceAdd: number;
  timelineAddWeeks: number;
};

type QuoteQuestionSeed = {
  key: string;
  label: string;
  options: QuoteOptionSeed[];
};

const QUOTE_QUESTIONS: QuoteQuestionSeed[] = [
  {
    key: "size",
    label: "Quante pagine o funzionalità ti servono?",
    options: [
      { key: "small", label: "Poche, essenziali", priceMultiplier: 1, priceAdd: 0, timelineAddWeeks: 0 },
      { key: "medium", label: "Una via di mezzo", priceMultiplier: 1.4, priceAdd: 0, timelineAddWeeks: 1 },
      { key: "large", label: "Tante, articolate", priceMultiplier: 1.9, priceAdd: 0, timelineAddWeeks: 3 },
    ],
  },
  {
    key: "design",
    label: "Hai già un design pronto?",
    options: [
      { key: "ready", label: "Sì, ce l'ho", priceMultiplier: 1, priceAdd: 0, timelineAddWeeks: 0 },
      { key: "fromScratch", label: "No, serve da zero", priceMultiplier: 1, priceAdd: 600, timelineAddWeeks: 1 },
    ],
  },
  {
    key: "timeline",
    label: "Che tempistica ti serve?",
    options: [
      { key: "standard", label: "Standard, va bene", priceMultiplier: 1, priceAdd: 0, timelineAddWeeks: 0 },
      { key: "urgent", label: "Urgente", priceMultiplier: 1.2, priceAdd: 0, timelineAddWeeks: -1 },
    ],
  },
];

async function run() {
  const client = getCliClient().withConfig({ apiVersion: "2026-08-01" });

  await client.createOrReplace({
    _id: "pricingSettings",
    _type: "pricingSettings",
    services: PRICING_SERVICES.map((s, i) => ({
      _type: "pricingService",
      _key: `svc-${i}`,
      service: { _type: "reference", _ref: s.serviceId },
      basePrice: s.basePrice,
      baseTimelineWeeks: s.baseTimelineWeeks,
      features: s.features.map((text, fi) => ({
        _type: "localeString",
        _key: `f-${fi}`,
        it: text,
      })),
      order: s.order,
    })),
    quoteQuestions: QUOTE_QUESTIONS.map((q, i) => ({
      _type: "quoteQuestion",
      _key: `q-${i}`,
      key: q.key,
      label: { _type: "localeString", it: q.label },
      options: q.options.map((o, oi) => ({
        _type: "quoteOption",
        _key: `o-${oi}`,
        key: o.key,
        label: { _type: "localeString", it: o.label },
        priceMultiplier: o.priceMultiplier,
        priceAdd: o.priceAdd,
        timelineAddWeeks: o.timelineAddWeeks,
      })),
    })),
    quoteSettings: {
      _type: "object",
      rangeSpreadPercent: 15,
      roundTo: 100,
      resultTitle: { _type: "localeString", it: "Ecco una stima" },
      resultDisclaimer: {
        _type: "localeText",
        it: "È una stima, non un preventivo fisso — il prezzo esatto lo confermiamo in una chiamata gratuita.",
      },
      ctaLabel: { _type: "localeString", it: "Chiedi un preventivo" },
    },
  });

  console.log("✓ \"Impostazioni prezzi\" creato/aggiornato, collegato ai 4 servizi.");
  console.log(
    "  Da fare in Studio: rivedere i prezzi, e compilare gli en di features/domande/opzioni/risultato.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
