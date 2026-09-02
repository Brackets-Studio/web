import { defineField, defineType } from "sanity";
import { RocketIcon } from "@sanity/icons/Rocket";

/**
 * Una voce di `/lab`: esperimento, componente open source o piccolo tool.
 * Documento a sé (non un array in un singleton) perché ogni voce ha un suo
 * slug e cresce nel tempo — stessa logica di `service`/`caseStudy`, non di
 * `socialProof.logos`.
 *
 * Il copy della pagina indice (eyebrow/titolo/sottotitolo) vive nei file
 * `messages` come per `/work` e `/servizi`: qui c'è solo il contenuto che
 * varia voce per voce.
 */
export const labItem = defineType({
  name: "labItem",
  title: "Lab — voce",
  type: "document",
  icon: RocketIcon,
  groups: [
    { name: "content", title: "Contenuto", default: true },
    { name: "links", title: "Link" },
    { name: "settings", title: "Impostazioni" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "localeString",
      group: "content",
      validation: (Rule) =>
        Rule.custom((value: { it?: string; en?: string } | undefined) => {
          if (!value?.it || !value?.en) return "Both languages are required";
          return true;
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Esperimento", value: "experiment" },
          { title: "Componente open source", value: "component" },
          { title: "Tool", value: "tool" },
        ],
        layout: "radio",
      },
      initialValue: "experiment",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Descrizione breve",
      description: "Usata nella card dell'elenco.",
      type: "localeText",
      group: "content",
      validation: (Rule) =>
        Rule.custom((value: { it?: string; en?: string } | undefined) => {
          if (!value?.it || !value?.en) return "Both languages are required";
          return true;
        }),
    }),
    defineField({
      name: "tags",
      title: "Tag / tech stack",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "image",
      title: "Immagine / screenshot",
      type: "image",
      options: { hotspot: true },
      group: "content",
      fields: [
        defineField({ name: "alt", title: "Testo alternativo", type: "localeString" }),
      ],
    }),
    defineField({
      name: "demoUrl",
      title: "Link demo",
      type: "url",
      group: "links",
      validation: (Rule) => Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "repoUrl",
      title: "Link repository",
      description: "Repo pubblica (es. GitHub), per i componenti open source.",
      type: "url",
      group: "links",
      validation: (Rule) => Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "status",
      title: "Stato",
      type: "string",
      options: {
        list: [
          { title: "Live", value: "live" },
          { title: "In lavorazione", value: "wip" },
          { title: "Archiviato", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "live",
      group: "settings",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "In evidenza",
      description: "Le voci in evidenza compaiono per prime.",
      type: "boolean",
      initialValue: false,
      group: "settings",
    }),
    defineField({
      name: "order",
      title: "Ordine",
      type: "number",
      initialValue: 0,
      group: "settings",
    }),
    defineField({
      name: "publishedAt",
      title: "Data",
      type: "datetime",
      group: "settings",
    }),
  ],
  orderings: [
    {
      title: "In evidenza, poi ordine",
      name: "featuredOrder",
      by: [
        { field: "featured", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title.en",
      kind: "kind",
      status: "status",
      media: "image",
      featured: "featured",
    },
    prepare({ title, kind, status, media, featured }) {
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: `${kind ?? ""} — ${status ?? ""}`,
        media,
      };
    },
  },
});
