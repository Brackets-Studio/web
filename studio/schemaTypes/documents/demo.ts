import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons/Play";
import { PRESET_OPTIONS } from "../../../lib/verticals/presets";

/**
 * La scheda di una demo finta pubblicata su `vetrina/` (`demo.bracketstudio.it`),
 * non la demo stessa: il sito vive in quella repo, qui sta solo il puntatore.
 *
 * `docs/ideas/vetrina-demo-per-tipologia.md` §10.1 spiega perché non è né un
 * `caseStudy` (bilingue, pensato per risultati veri) né una voce di
 * `vertical.proof.screenshots` (quell'array *è* la regola del consenso —
 * un'attività inventata non ha un consenso da dare né da negare).
 *
 * Le assenze sono progettate: niente `metrics`, `beforeAfter`, `retrospective`,
 * `consentGiven`, niente `seo` — un campo che non esiste è un campo che non si
 * può riempire di numeri finti su un'attività che non c'è.
 */
export const demo = defineType({
  name: "demo",
  title: "Demo",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nome",
      description: "Nome di fantasia, es. \"Ferramenta Bucci\".",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tipologia",
      title: "Tipologia",
      description: "Deve combaciare con una tipologia di `vetrina/content/_types.ts` (TIPOLOGIE).",
      type: "string",
      options: {
        list: [
          { title: "Ristorazione", value: "ristorazione" },
          { title: "Negozio fisico", value: "negozio" },
          { title: "Su appuntamento", value: "appuntamento" },
          { title: "Ospitalità", value: "ospitalita" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "varianteLabel",
      title: "Etichetta variante",
      description: "Quello che si legge sul chip: \"Pizzeria\", \"Sushi\".",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "linea",
      title: "Linea",
      description: "Decide quali landing possono referenziare questa demo — vedi il filtro su `vertical.demos`.",
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
    }),
    defineField({
      name: "url",
      title: "URL della demo",
      description: "La pagina live, es. https://demo.bracketstudio.it/negozio/ferramenta.",
      type: "url",
      validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "screenshot",
      title: "Screenshot",
      description: "Obbligatorio: stessa scelta già fatta su `vertical.proof.screenshots` — un mockup vuoto è peggio di non avere la sezione.",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "preset",
      title: "Preset visivo",
      description: "Riusa i preset di `lib/verticals/presets.ts`, come `vertical.theme.preset`.",
      type: "string",
      options: { list: PRESET_OPTIONS },
    }),
    defineField({
      name: "pitchLine",
      title: "Pitch",
      description: "Una riga: cosa dimostra questa demo.",
      type: "string",
    }),
    defineField({
      name: "active",
      title: "Attiva",
      description: "Se disattivata, non compare in nessuna landing indipendentemente dai riferimenti esistenti.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "varianteLabel", media: "screenshot", active: "active" },
    prepare({ title, subtitle, media, active }) {
      return {
        title,
        media,
        subtitle: `${subtitle ?? ""}${active ? "" : " — inattiva"}`,
      };
    },
  },
});
