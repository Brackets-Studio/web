import { defineField, defineType } from "sanity";
import { WrenchIcon } from "@sanity/icons/Wrench";

/**
 * Una pagina di servizio (`/servizi/<slug>`), bilingue: a differenza delle
 * landing verticali qui il pubblico è sia IT che EN, quindi ogni campo
 * testuale usa `localeString`/`localeText`.
 *
 * `slug` è anche la chiave di join con `pricingSettings.services[].key`: il
 * prezzo "a partire da" sulla pagina di dettaglio arriva da lì, non è un
 * campo di questo documento.
 */
export const service = defineType({
  name: "service",
  title: "Servizio",
  type: "document",
  icon: WrenchIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "localeString",
      validation: (Rule) =>
        Rule.custom((value: { it?: string; en?: string } | undefined) => {
          if (!value?.it || !value?.en) return "Both languages are required";
          return true;
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Determina l'URL: /servizi/<slug>. Deve combaciare con la chiave usata in \"Impostazioni prezzi\" per collegare il prezzo.",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "localeString",
    }),
    defineField({
      name: "shortDescription",
      title: "Descrizione breve",
      description: "Usata nelle card (home, indice servizi) e come meta description di fallback.",
      type: "localeText",
      validation: (Rule) =>
        Rule.custom((value: { it?: string; en?: string } | undefined) => {
          if (!value?.it || !value?.en) return "Both languages are required";
          return true;
        }),
    }),
    defineField({
      name: "tags",
      title: "Tag",
      type: "array",
      of: [{ type: "localeString" }],
    }),
    defineField({
      name: "heroImage",
      title: "Immagine",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Testo alternativo", type: "localeString" }),
      ],
    }),
    defineField({
      name: "detail",
      title: "Dettaglio",
      type: "object",
      fields: [
        defineField({ name: "summary", title: "Riassunto", type: "localeText" }),
        defineField({
          name: "highlights",
          title: "Punti chiave",
          type: "array",
          of: [{ type: "localeString" }],
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Corpo (opzionale)",
      description: "Contenuto extra per la pagina di dettaglio. Può restare vuoto — la pagina è volutamente barebone.",
      type: "localeBlockContent",
    }),
    defineField({
      name: "order",
      title: "Ordine",
      description: "Determina la posizione in home e nell'indice /servizi.",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Ordine",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.en", subtitle: "slug.current", media: "heroImage" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: `/servizi/${subtitle ?? ""}`, media };
    },
  },
});
