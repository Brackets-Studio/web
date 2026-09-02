import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Contenuto", default: true },
    { name: "body", title: "Corpo" },
    { name: "settings", title: "Impostazioni" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      name: "excerpt",
      title: "Excerpt",
      description: "Short summary used in listings and as a meta description fallback.",
      type: "localeText",
      group: "content",
      validation: (Rule) =>
        Rule.custom((value: { it?: string; en?: string } | undefined) => {
          if (!value?.it || !value?.en) return "Both languages are required";
          return true;
        }),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      group: "content",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "localeString",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "tags",
      title: "Topics",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "localeBlockContent",
      group: "body",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "settings",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "settings",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title.en", subtitle: "excerpt.en", media: "coverImage" },
  },
});
