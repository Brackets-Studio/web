import { defineField, defineType } from "sanity";
import { BarChartIcon } from "@sanity/icons/BarChart";

/**
 * Fonte unica dei prezzi dello studio (non delle landing verticali, che
 * hanno il proprio listino per pacchetto — vedi `verticalDefaults`).
 *
 * Singleton: alzare `basePrice` di un servizio qui aggiorna in un colpo solo
 * le card di `/pricing`, il preventivatore interattivo e il teaser "a partire
 * da" sulle pagine `/servizi/<slug>` — mai più prezzi copiati a mano in più
 * pagine.
 *
 * `services[].service` è una `reference` al documento Servizio: nome e
 * descrizione mostrati arrivano da lì (dereferenziati in query), non sono
 * ridigitati qui. Prima questo campo era una stringa `key` da far combaciare a
 * mano con lo slug del servizio — un editor poteva sbagliare a scriverla senza
 * che Studio se ne accorgesse, e uno slug rinominato rompeva il collegamento in
 * silenzio. La reference lo rende un menu a tendina: impossibile scegliere un
 * servizio che non esiste, impossibile un refuso.
 */
export const pricingSettings = defineType({
  name: "pricingSettings",
  title: "Impostazioni prezzi",
  type: "document",
  icon: BarChartIcon,
  groups: [
    { name: "services", title: "Servizi e prezzi", default: true },
    { name: "quote", title: "Preventivatore" },
  ],
  fields: [
    defineField({
      name: "services",
      title: "Servizi",
      type: "array",
      group: "services",
      of: [
        {
          type: "object",
          name: "pricingService",
          fields: [
            defineField({
              name: "service",
              title: "Servizio",
              description: "Il documento Servizio a cui questo prezzo si riferisce. Nome e descrizione arrivano da lì.",
              type: "reference",
              to: [{ type: "service" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "basePrice",
              title: "Prezzo base (€)",
              type: "number",
              validation: (Rule) => Rule.required().positive(),
            }),
            defineField({
              name: "baseTimelineWeeks",
              title: "Tempistica base (settimane)",
              type: "number",
              validation: (Rule) => Rule.required().positive(),
            }),
            defineField({
              name: "features",
              title: "Cosa include (a questo prezzo)",
              description: "Elenco specifico del prezzo — distinto dai \"punti chiave\" del Servizio, che sono copy marketing.",
              type: "array",
              of: [{ type: "localeString" }],
            }),
            defineField({ name: "order", title: "Ordine", type: "number", initialValue: 0 }),
          ],
          preview: {
            select: { title: "service.title.it", slug: "service.slug.current", price: "basePrice" },
            prepare({ title, slug, price }) {
              return {
                title: title || slug || "(nessun servizio collegato)",
                subtitle: `${slug ?? "?"} — da €${price ?? "?"}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "quoteQuestions",
      title: "Domande del preventivatore",
      description: "Ordinate: compaiono nel calcolatore nell'ordine in cui sono qui, dopo la scelta del servizio.",
      type: "array",
      group: "quote",
      of: [
        {
          type: "object",
          name: "quoteQuestion",
          fields: [
            defineField({ name: "key", title: "Chiave", type: "string", validation: (Rule) => Rule.required() }),
            defineField({ name: "label", title: "Domanda", type: "localeString" }),
            defineField({
              name: "options",
              title: "Opzioni",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "quoteOption",
                  fields: [
                    defineField({ name: "key", title: "Chiave", type: "string", validation: (Rule) => Rule.required() }),
                    defineField({ name: "label", title: "Testo", type: "localeString" }),
                    defineField({
                      name: "priceMultiplier",
                      title: "Moltiplicatore prezzo",
                      description: "1 = nessun effetto. Es. 1.4 aumenta il prezzo del 40%.",
                      type: "number",
                      initialValue: 1,
                    }),
                    defineField({
                      name: "priceAdd",
                      title: "Aggiunta fissa (€)",
                      type: "number",
                      initialValue: 0,
                    }),
                    defineField({
                      name: "timelineAddWeeks",
                      title: "Settimane aggiuntive",
                      type: "number",
                      initialValue: 0,
                    }),
                  ],
                  preview: {
                    select: {
                      title: "label.en",
                      key: "key",
                      multiplier: "priceMultiplier",
                      add: "priceAdd",
                    },
                    prepare({ title, key, multiplier, add }) {
                      const effect = [
                        multiplier && multiplier !== 1 ? `×${multiplier}` : null,
                        add ? `+€${add}` : null,
                      ]
                        .filter(Boolean)
                        .join(" ") || "nessun effetto sul prezzo";
                      return { title: title || key || "(senza chiave)", subtitle: effect };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "label.en", key: "key" },
            prepare({ title, key }) {
              return { title: title || key || "(senza chiave)", subtitle: key };
            },
          },
        },
      ],
    }),
    defineField({
      name: "quoteSettings",
      title: "Impostazioni risultato",
      type: "object",
      group: "quote",
      fields: [
        defineField({
          name: "rangeSpreadPercent",
          title: "Ampiezza fascia (%)",
          description: "Il prezzo calcolato viene mostrato come fascia ± questa percentuale. Es. 15.",
          type: "number",
          initialValue: 15,
        }),
        defineField({
          name: "roundTo",
          title: "Arrotonda a (€)",
          type: "number",
          initialValue: 100,
        }),
        defineField({ name: "resultTitle", title: "Titolo risultato", type: "localeString" }),
        defineField({ name: "resultDisclaimer", title: "Testo disclaimer", type: "localeText" }),
        defineField({ name: "ctaLabel", title: "Testo CTA", type: "localeString" }),
      ],
    }),
  ],
  preview: {
    select: { services: "services", questions: "quoteQuestions" },
    prepare({ services, questions }) {
      const serviceCount = Array.isArray(services) ? services.length : 0;
      const questionCount = Array.isArray(questions) ? questions.length : 0;
      return {
        title: "Impostazioni prezzi",
        subtitle: `${serviceCount} servizi — ${questionCount} domande preventivatore`,
      };
    },
  },
});
