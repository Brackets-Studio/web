import { defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "content", title: "Contenuto", default: true },
    { name: "story", title: "Racconto" },
    { name: "results", title: "Risultati" },
    { name: "settings", title: "Impostazioni" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Client / project name",
      type: "string",
      description: "Proper noun, not translated (e.g. \"Smartables\").",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description: "Short one-liner used in listings and as a meta description fallback.",
      type: "localeString",
      group: "content",
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
      title: "Tags / tech stack",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({
      name: "problem",
      title: "Problem",
      type: "localeText",
      group: "story",
    }),
    defineField({
      name: "solution",
      title: "Solution",
      type: "localeText",
      group: "story",
    }),
    defineField({
      name: "result",
      title: "Result",
      description: "Shown as the highlighted outcome on the case study card.",
      type: "localeText",
      group: "story",
    }),
    defineField({
      name: "detailSummary",
      title: "Detail summary",
      description: "Longer narrative shown in the case study detail view.",
      type: "localeText",
      group: "story",
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [{ type: "localeString" }],
      group: "story",
    }),
    defineField({
      name: "metrics",
      title: "Metrics",
      description: "Optional headline numbers, e.g. \"-40%\" / \"response time\".",
      type: "array",
      group: "results",
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
      name: "retrospective",
      title: "Cosa abbiamo imparato",
      description: "Cosa abbiamo sbagliato o cosa rifaremmo diversamente. Facoltativo: lascia vuoto se non c'è nulla di genuino da raccontare — meglio assente che finto. Quando c'è, è la parte più credibile del case study: nessuna agenzia pubblica solo vittorie.",
      type: "localeText",
      group: "results",
    }),
    defineField({
      name: "beforeAfter",
      title: "Confronto prima/dopo",
      description: "Facoltativo — lascia vuoto se per questo progetto non esiste un \"prima\" comparabile (primo sito del cliente, o strumento interno senza equivalente pubblico).",
      type: "object",
      group: "results",
      fields: [
        defineField({
          name: "beforeImage",
          title: "Screenshot — prima",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "afterImage",
          title: "Screenshot — dopo",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "beforeLighthouse",
          title: "Lighthouse — prima",
          type: "object",
          fields: [
            defineField({ name: "performance", title: "Performance", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
            defineField({ name: "accessibility", title: "Accessibilità", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
            defineField({ name: "bestPractices", title: "Best practices", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
            defineField({ name: "seo", title: "SEO", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
          ],
        }),
        defineField({
          name: "afterLighthouse",
          title: "Lighthouse — dopo",
          type: "object",
          fields: [
            defineField({ name: "performance", title: "Performance", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
            defineField({ name: "accessibility", title: "Accessibilità", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
            defineField({ name: "bestPractices", title: "Best practices", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
            defineField({ name: "seo", title: "SEO", type: "number", validation: (Rule) => Rule.min(0).max(100) }),
          ],
        }),
      ],
    }),
    defineField({
      name: "externalLink",
      title: "Client link",
      type: "url",
      group: "settings",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      description: "Featured case studies are shown first.",
      type: "boolean",
      initialValue: false,
      group: "settings",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "settings",
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
      title: "Featured, then newest",
      name: "featuredDesc",
      by: [
        { field: "featured", direction: "desc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "excerpt.en",
      media: "mainImage",
      featured: "featured",
    },
    prepare({ title, subtitle, media, featured }) {
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: subtitle || "(nessun excerpt)",
        media,
      };
    },
  },
});
