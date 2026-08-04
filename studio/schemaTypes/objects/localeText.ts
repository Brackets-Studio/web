import { defineField, defineType } from "sanity";

export const localeText = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({ name: "it", title: "Italiano", type: "text", rows: 3 }),
    defineField({ name: "en", title: "English", type: "text", rows: 3 }),
  ],
  preview: {
    select: { it: "it", en: "en" },
    prepare({ it, en }) {
      return { title: it || en || "(empty)" };
    },
  },
});
