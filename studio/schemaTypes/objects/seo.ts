import { defineField, defineType } from "sanity";
import { SearchIcon } from "@sanity/icons/Search";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "title",
      title: "Meta title override",
      description: "Overrides the default title (name/quote) if provided. Keep under ~60 characters.",
      type: "localeString",
    }),
    defineField({
      name: "description",
      title: "Meta description override",
      description: "Overrides the default excerpt if provided. Keep under ~155 characters.",
      type: "localeText",
    }),
    defineField({
      name: "image",
      title: "Social share image",
      description: "Used for Open Graph / Twitter cards (1200x630 recommended). Falls back to the main image.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
