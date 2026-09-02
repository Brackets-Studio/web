import { getCliClient } from "sanity/cli";

/**
 * Ripristina come BOZZA (drafts.pricingSettings) i 3 servizi (web, ai, cloud)
 * che erano stati cancellati dal pubblicato: un editor ha pubblicato una
 * bozza vecchia/incompleta che conteneva solo "App per cellulare", e la
 * pubblicazione ha sovrascritto l'intero documento pubblicato (l'array
 * `services` non fa merge, viene rimpiazzato).
 *
 * L'elemento "App per cellulare" attualmente pubblicato viene preservato
 * così com'è (le sue `features` erano state modificate a mano rispetto al
 * seed originale di `003-impostazioni-prezzi.ts`), i 3 mancanti vengono
 * reintrodotti con gli stessi valori del seed originale.
 *
 * Scrive SOLO la bozza (`drafts.pricingSettings`), non tocca il pubblicato:
 * va rivista e pubblicata a mano da Studio.
 *
 * Si esegue dalla cartella `studio/`:
 *
 *   npx sanity exec migrations/005-ripristina-bozza-prezzi.ts --with-user-token
 */

const CURRENT_PUBLISHED_MOBILE = {
  _type: "pricingService",
  _key: "5747c3002856",
  service: { _type: "reference", _ref: "service-mobile" },
  basePrice: 1500,
  baseTimelineWeeks: 3,
  features: [
    {
      _type: "localeString",
      _key: "86ba64233cae",
      en: "Prototype wireframing and interface refinement",
      it: "Wireframing del prototipo e consolidamento dell'interfaccia",
    },
    {
      _type: "localeString",
      _key: "8e28e42a5e58",
      en: "Development and creation of mobile apps for iOS and Android",
      it: "Sviluppo e realizzazione app mobile per iOS e Android",
    },
    {
      _type: "localeString",
      _key: "85c797d5e62b",
      en: "Release on major app stores",
      it: "Pubblicazione sui principali store",
    },
  ],
  order: 2,
};

const RESTORED_SERVICES = [
  {
    _type: "pricingService",
    _key: "svc-restore-web",
    service: { _type: "reference", _ref: "service-web" },
    basePrice: 1500,
    baseTimelineWeeks: 3,
    features: [
      { _type: "localeString", _key: "f-0", it: "Progettazione e contenuti insieme a te" },
      { _type: "localeString", _key: "f-1", it: "Pannello semplice per aggiornarlo da solo" },
      { _type: "localeString", _key: "f-2", it: "Dominio, hosting e primo anno inclusi" },
    ],
    order: 1,
  },
  CURRENT_PUBLISHED_MOBILE,
  {
    _type: "pricingService",
    _key: "svc-restore-ai",
    service: { _type: "reference", _ref: "service-ai" },
    basePrice: 3000,
    baseTimelineWeeks: 4,
    features: [
      { _type: "localeString", _key: "f-0", it: "Lettura automatica di documenti" },
      { _type: "localeString", _key: "f-1", it: "Automazioni su misura" },
      { _type: "localeString", _key: "f-2", it: "Collegamenti ai programmi che usi già" },
    ],
    order: 3,
  },
  {
    _type: "pricingService",
    _key: "svc-restore-cloud",
    service: { _type: "reference", _ref: "service-cloud" },
    basePrice: 2000,
    baseTimelineWeeks: 3,
    features: [
      { _type: "localeString", _key: "f-0", it: "Server monitorati, con backup" },
      { _type: "localeString", _key: "f-1", it: "Collegamento a WhatsApp Business o centralino" },
      { _type: "localeString", _key: "f-2", it: "Nessuna manutenzione a carico tuo" },
    ],
    order: 4,
  },
];

async function run() {
  const client = getCliClient().withConfig({ apiVersion: "2026-08-01" });

  const published = await client.getDocument("pricingSettings");
  if (!published) {
    throw new Error("Documento pubblicato pricingSettings non trovato — controlla il dataset.");
  }

  await client.createOrReplace({
    ...published,
    _id: "drafts.pricingSettings",
    services: RESTORED_SERVICES,
  });

  console.log("✓ Bozza drafts.pricingSettings creata con i 4 servizi (web, mobile, ai, cloud).");
  console.log("  Il pubblicato NON è stato toccato. Rivedi in Studio e premi Publish quando è ok.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
