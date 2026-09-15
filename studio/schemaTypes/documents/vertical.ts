import { defineField, defineType } from "sanity";
import { PinIcon } from "@sanity/icons/Pin";
// Unica fonte di verità dei preset: sta nell'app perché è lì che i token
// diventano CSS. Lo Studio ne importa solo la lista, così un preset aggiunto in
// codice compare subito nella tendina senza doverlo riscrivere qui.
import { PRESET_OPTIONS } from "../../../lib/verticals/presets";

/**
 * Landing verticale per settore (ristoranti, palestre, ...), IT-only per
 * scelta: sono pagine di local SEO scritte per un pubblico italiano
 * iperlocale (Pesaro), non contenuto bilingue dello studio. Per questo i
 * campi testo qui sono `string`/`text` semplici e non `localeString`/
 * `localeText` — quei tipi impongono un valore `en` che qui non esiste.
 */
export const vertical = defineType({
  name: "vertical",
  title: "Landing verticale",
  type: "document",
  icon: PinIcon,
  groups: [
    { name: "content", title: "Contenuto", default: true },
    { name: "proof", title: "Prova" },
    { name: "overrides", title: "Override" },
    { name: "settings", title: "Impostazioni" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Nome verticale",
      description: "Nome interno, es. \"Ristoranti\". Non è testo pubblico.",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Determina l'URL: bracketstudio.it/it/<slug>.",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      group: "content",
    }),
    defineField({
      name: "active",
      title: "Attiva",
      description: "Se disattivata, la pagina non viene generata (404) indipendentemente dall'indicizzazione.",
      type: "boolean",
      initialValue: false,
      group: "settings",
    }),
    defineField({
      name: "serviceType",
      title: "Tipo di servizio (JSON-LD)",
      description: "Es. \"Sviluppo siti web per ristoranti\". Usato nello structured data Service.",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "settings",
    }),
    defineField({
      name: "linea",
      title: "Linea",
      description:
        "Prodotto (€800) o commessa (da €1.500). Filtra quali demo (sotto, in \"Prova\") questa landing può referenziare: una demo di linea commessa non deve poter finire accanto agli €800, altrimenti ancora al ribasso un lavoro da €1.500 (`docs/strategy/positioning-bracketstudio.md` §3.1).",
      type: "string",
      options: {
        list: [
          { title: "Prodotto (€800)", value: "prodotto" },
          { title: "Commessa (da €1.500)", value: "commessa" },
        ],
        layout: "radio",
      },
      initialValue: "prodotto",
      validation: (Rule) => Rule.required(),
      group: "settings",
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "content",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          description: "Es. \"Pesaro · Ristoranti, pizzerie, locali\". Piccola etichetta sopra il titolo.",
          type: "string",
        }),
        defineField({ name: "title", title: "Titolo", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "subtitle", title: "Sottotitolo", type: "text", rows: 2 }),
        defineField({
          name: "image",
          title: "Immagine di copertina",
          description:
            "La foto grande dietro il titolo, a tutta larghezza. Orizzontale, e dell'AMBIENTE della nicchia (una sala, un bancone, un attrezzo), non uno screenshot di un sito. È la prima cosa che dice al visitatore \"questa pagina parla di me\": senza, l'hero resta a fondo tinta unita.",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Testo alternativo", type: "string" }),
          ],
        }),
        defineField({
          name: "priceDisplay",
          title: "Prezzo (visualizzato)",
          description:
            "Es. \"50€ al mese\". Lasciare vuoto per riusare l'importo rateizzato del blocco Prezzo: compilarlo significa poterlo far divergere dal prezzo vero.",
          type: "string",
        }),
        defineField({ name: "priceNote", title: "Nota prezzo", type: "string" }),
      ],
    }),
    defineField({
      name: "vibeImages",
      title: "Foto ambiente",
      description: "2-3 foto che raccontano l'ambiente della nicchia (una sala, un locale, un bancone...), non i lavori fatti — vanno bene anche foto stock, non devono ritrarre un cliente reale. Compaiono come banda accanto al \"come funziona\". Se vuote, la pagina salta quella banda.",
      type: "array",
      validation: (Rule) => Rule.max(3),
      group: "content",
      of: [
        {
          type: "image",
          name: "vibeImage",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Testo alternativo", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "proof",
      title: "Sezione prova",
      type: "object",
      group: "proof",
      fields: [
        defineField({ name: "title", title: "Titolo", type: "string" }),
        defineField({ name: "subtitle", title: "Sottotitolo", type: "string" }),
        defineField({
          name: "intro",
          title: "Testo introduttivo",
          description: "Paragrafo più lungo sopra gli screenshot, opzionale.",
          type: "text",
          rows: 2,
        }),
        defineField({
          name: "anonymousCaption",
          title: "Didascalia anonima",
          description: "Usata quando uno screenshot non ha consenso esplicito a mostrare il nome del cliente.",
          type: "string",
        }),
        defineField({
          name: "screenshots",
          title: "Screenshot",
          type: "array",
          of: [
            {
              type: "object",
              name: "screenshot",
              fields: [
                defineField({
                  name: "image",
                  title: "Immagine",
                  description: "Obbligatoria: uno screenshot senza immagine renderizzava un telefono vuoto in pagina, che è peggio di non avere la sezione.",
                  type: "image",
                  options: { hotspot: true },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "clientName",
                  title: "Nome cliente",
                  description: "Mostrato SOLO se \"Consenso ottenuto\" è spuntato. Altrimenti si usa la didascalia anonima.",
                  type: "string",
                }),
                defineField({
                  name: "consentGiven",
                  title: "Consenso ottenuto",
                  description: "Obbligatorio da impostare esplicitamente. Un prospect attivo o una trattativa aperta NON hanno consenso: lasciare disattivato e senza nome cliente.",
                  type: "boolean",
                  initialValue: false,
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "href",
                  title: "Link",
                  type: "url",
                  validation: (Rule) => Rule.uri({ allowRelative: true }),
                }),
              ],
              preview: {
                select: { title: "clientName", consent: "consentGiven", media: "image" },
                prepare({ title, consent, media }) {
                  return {
                    title: title || "(anonimo)",
                    subtitle: consent ? "consenso ok" : "⚠️ nessun consenso — resta anonimo",
                    media,
                  };
                },
              },
            },
          ],
        }),
        defineField({
          name: "demos",
          title: "Demo",
          description:
            "Esempi finti da mostrare in questa landing, gestiti su `vetrina/` — mai il case study vero: quello resta in \"Screenshot\" sopra. Il filtro ammette solo demo con la stessa `linea` di questa landing, per costruzione, non per convenzione.",
          type: "array",
          of: [
            {
              type: "reference",
              to: [{ type: "demo" }],
              options: {
                filter: ({ document }: { document: { linea?: string } }) => ({
                  filter: "linea == $linea",
                  params: { linea: document.linea ?? "prodotto" },
                }),
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "benefits",
      title: "Benefici",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "title", title: "Titolo sezione", type: "string" }),
        defineField({
          name: "items",
          title: "Voci",
          type: "array",
          of: [
            {
              type: "object",
              name: "benefit",
              fields: [
                defineField({ name: "title", title: "Titolo", type: "string" }),
                defineField({ name: "text", title: "Testo", type: "text", rows: 2 }),
              ],
              preview: { select: { title: "title", subtitle: "text" } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "process",
      title: "Come funziona",
      description: "Sequenza reale dei passaggi, in ordine: qui la numerazione ha senso perché è un vero prima/dopo.",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "title", title: "Titolo sezione", type: "string" }),
        defineField({
          name: "steps",
          title: "Passaggi",
          type: "array",
          validation: (Rule) => Rule.max(4),
          of: [
            {
              type: "object",
              name: "step",
              fields: [
                defineField({ name: "title", title: "Titolo", type: "string" }),
                defineField({ name: "text", title: "Testo", type: "text", rows: 2 }),
              ],
              preview: { select: { title: "title", subtitle: "text" } },
            },
          ],
        }),
      ],
    }),
    /*
     * Da qui in giù: override facoltativi.
     *
     * Il valore vero sta su "Impostazioni verticali" (verticalDefaults) e vale
     * per ogni landing. Questi campi servono SOLO quando una nicchia si comporta
     * diversamente dalle altre — un prezzo suo, un'obiezione che arriva solo lì.
     * Lasciarli vuoti è la scelta giusta nella maggior parte dei casi: è quello
     * che tiene sette landing allineate quando cambi il listino in un posto solo.
     */
    defineField({
      name: "price",
      title: "Prezzo (override)",
      description: "Vuoto = si usa il prezzo delle Impostazioni verticali. I singoli campi si sovrascrivono uno per uno: compilare solo l'importo lascia intatte le voci incluse predefinite.",
      type: "verticalPrice",
      group: "overrides",
    }),
    defineField({
      name: "objections",
      title: "Obiezioni (override)",
      description: "Vuoto = si usano le obiezioni predefinite. Se compili l'elenco, sostituisce quello condiviso per intero — non lo integra.",
      type: "verticalObjections",
      group: "overrides",
    }),
    defineField({
      name: "about",
      title: "\"Chi sono\" (override)",
      description: "Vale la pena compilarlo: è la riga che cambia parola per ogni settore (\"faccio siti per i locali della zona\" vs \"per le palestre della zona\"). Vuoto = testo predefinito.",
      type: "object",
      group: "overrides",
      fields: [
        defineField({ name: "text", title: "Testo", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "closingCta",
      title: "CTA finale (override)",
      description: "Ultimo blocco della pagina, dopo il \"chi sono\". Vuoto = testo predefinito.",
      type: "object",
      group: "overrides",
      fields: [
        defineField({ name: "title", title: "Titolo", type: "string" }),
        defineField({ name: "text", title: "Testo", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "relatedCaseStudies",
      title: "Case study collegati",
      type: "array",
      of: [{ type: "reference", to: [{ type: "caseStudy" }] }],
      group: "proof",
    }),
    defineField({
      name: "theme",
      title: "Tema visivo",
      description: "Il preset non è una palette: decide fondo e inchiostro, i font di titoli, testo ed etichette, gli angoli, lo spessore dei bordi, la forma dei bottoni e la texture. Una landing per palestre non è quella per ristoranti con un bottone di un altro colore — è un'altra pagina.",
      type: "object",
      group: "settings",
      fields: [
        defineField({
          name: "preset",
          title: "Preset",
          description: "Sceglilo in base al settore, non ai gusti: cambia l'intero vestito della pagina, non solo i colori. Sono combinazioni già verificate per contrasto e leggibilità.",
          type: "string",
          options: { list: PRESET_OPTIONS, layout: "radio" },
          initialValue: "neutro",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "accentOverride",
          title: "Accento personalizzato",
          description: "Da usare solo se il preset non basta — di norma lasciare vuoto. Tocca il solo colore d'accento: fondo e inchiostro restano quelli del preset, così il contrasto non si rompe.",
          type: "color",
          options: { disableAlpha: true },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "settings",
      description: "\"Nascondi dai motori di ricerca\" è attivo di default: va tolto a mano quando la verticale è pronta a essere indicizzata.",
    }),
  ],
  initialValue: {
    seo: { noIndex: true },
  },
  preview: {
    select: { title: "name", media: "hero.image", subtitle: "slug.current", active: "active" },
    prepare({ title, media, subtitle, active }) {
      return {
        title,
        media,
        subtitle: `/it/${subtitle ?? ""}${active ? "" : " — inattiva"}`,
      };
    },
  },
});
