import { defineField, defineType } from "sanity";

const blockContent = {
  type: "array",
  of: [
    {
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (Rule) =>
                  Rule.uri({ allowRelative: false, scheme: ["http", "https", "mailto"] }),
              }),
            ],
          },
        ],
      },
    },
    { type: "image", options: { hotspot: true } },
  ],
};

export const localeBlockContent = defineType({
  name: "localeBlockContent",
  title: "Localized body",
  type: "object",
  fields: [
    defineField({ name: "it", title: "Italiano", ...blockContent }),
    defineField({ name: "en", title: "English", ...blockContent }),
  ],
});
