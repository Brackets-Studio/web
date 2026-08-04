import { defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "name",
      title: "Client / project name",
      type: "string",
      description: "Proper noun, not translated (e.g. \"Smartables\").",
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
      name: "excerpt",
      title: "Excerpt",
      description: "Short one-liner used in listings and as a meta description fallback.",
      type: "localeString",
      validation: (Rule) =>
        Rule.custom((value: { it?: string; en?: string } | undefined) => {
          if (!value?.it || !value?.en) return "Both languages are required";
          return true;
        }),
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      options: { hotspot: true },
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
      title: "Tags / tech stack",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "problem",
      title: "Problem",
      type: "localeText",
    }),
    defineField({
      name: "solution",
      title: "Solution",
      type: "localeText",
    }),
    defineField({
      name: "result",
      title: "Result",
      description: "Shown as the highlighted outcome on the case study card.",
      type: "localeText",
    }),
    defineField({
      name: "metrics",
      title: "Metrics",
      description: "Optional headline numbers, e.g. \"-40%\" / \"response time\".",
      type: "array",
      of: [
        {
          type: "object",
          name: "metric",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "localeString" }),
          ],
          preview: {
            select: { value: "value", it: "label.it" },
            prepare({ value, it }) {
              return { title: `${value ?? ""} — ${it ?? ""}` };
            },
          },
        },
      ],
    }),
    defineField({
      name: "detailSummary",
      title: "Detail summary",
      description: "Longer narrative shown in the case study detail view.",
      type: "localeText",
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [{ type: "localeString" }],
    }),
    defineField({
      name: "externalLink",
      title: "Client link",
      type: "url",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      description: "Featured case studies are shown first.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Featured, then newest",
      name: "featuredDesc",
      by: [
        { field: "featured", direction: "desc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "excerpt.en", media: "mainImage" },
  },
});
