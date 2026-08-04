import { defineQuery } from "next-sanity";

/**
 * `$locale` drives every localized field below via select(); it/en are the
 * only two values routing.locales allows (see i18n/routing.ts).
 */
const localeField = (path: string) =>
  `select($locale == "it" => ${path}.it, ${path}.en)`;

const imageFragment = /* groq */ `
  asset->{
    _id,
    url,
    metadata { lqip, dimensions }
  },
  hotspot,
  crop
`;

export const CASE_STUDIES_QUERY = defineQuery(/* groq */ `
*[_type == "caseStudy"] | order(featured desc, coalesce(publishedAt, _createdAt) desc) {
  "id": _id,
  name,
  "slug": slug.current,
  "excerpt": ${localeField("excerpt")},
  "mainImage": mainImage {
    ${imageFragment}
    ,"alt": ${localeField("alt")}
  },
  tags,
  "problem": ${localeField("problem")},
  "solution": ${localeField("solution")},
  "result": ${localeField("result")},
  "metrics": metrics[]{
    value,
    "label": ${localeField("label")}
  },
  "detailSummary": ${localeField("detailSummary")},
  "highlights": highlights[]{
    "text": select($locale == "it" => it, en)
  },
  externalLink,
  featured,
  "updatedAt": _updatedAt
}`);

export const TESTIMONIALS_QUERY = defineQuery(/* groq */ `
*[_type == "testimonial"] | order(featured desc, _createdAt desc) {
  "id": _id,
  "quote": ${localeField("quote")},
  authorName,
  "authorRole": ${localeField("authorRole")},
  "avatar": avatar {
    ${imageFragment}
    ,alt
  },
  "relatedCaseStudySlug": relatedCaseStudy->slug.current
}`);

export const CASE_STUDY_SLUGS_QUERY = defineQuery(/* groq */ `
*[_type == "caseStudy" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`);
