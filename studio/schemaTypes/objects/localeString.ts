import { defineField, defineType } from "sanity";

export const localeString = defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: [
    defineField({ name: "it", title: "Italiano", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
  ],
  preview: {
    select: { it: "it", en: "en" },
    prepare({ it, en }) {
      return { title: it || en || "(empty)" };
    },
  },
});
