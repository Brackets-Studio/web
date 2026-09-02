import { defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";

/**
 * Striscia di fiducia sotto l'hero della home: marquee di loghi clienti.
 * Singleton — se vuota (nessun logo), la sezione non compare in pagina.
 */
export const socialProof = defineType({
  name: "socialProof",
  title: "Loghi clienti",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Etichetta (opzionale)",
      description: "Piccola scritta sopra i loghi, es. \"Chi si è già fidato di noi\". Vuota = niente etichetta.",
      type: "localeString",
    }),
    defineField({
      name: "logos",
      title: "Loghi clienti",
      type: "array",
      of: [
        {
          type: "object",
          name: "clientLogo",
          fields: [
            defineField({
              name: "image",
              title: "Logo",
              type: "image",
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "alt", title: "Testo alternativo", type: "localeString" }),
            defineField({ name: "name", title: "Nome cliente (interno)", type: "string" }),
            defineField({
              name: "href",
              title: "Link (opzionale)",
              type: "url",
              validation: (Rule) => Rule.uri({ allowRelative: true }),
            }),
          ],
          preview: { select: { title: "name", media: "image" } },
        },
      ],
    }),
  ],
  preview: {
    select: { logos: "logos" },
    prepare({ logos }) {
      const count = Array.isArray(logos) ? logos.length : 0;
      return {
        title: "Loghi clienti",
        subtitle: count === 0 ? "Vuoto — sezione nascosta in home" : `${count} loghi`,
      };
    },
  },
});
