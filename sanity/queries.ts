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
  "tags": coalesce(tags, []),
  "problem": ${localeField("problem")},
  "solution": ${localeField("solution")},
  "result": ${localeField("result")},
  "metrics": coalesce(metrics[]{
    value,
    "label": ${localeField("label")}
  }, []),
  "detailSummary": ${localeField("detailSummary")},
  "highlights": coalesce(highlights[]{
    "text": select($locale == "it" => it, en)
  }, []),
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

export const CASE_STUDY_BY_SLUG_QUERY = defineQuery(/* groq */ `
*[_type == "caseStudy" && slug.current == $slug][0] {
  "id": _id,
  name,
  "slug": slug.current,
  "excerpt": ${localeField("excerpt")},
  "mainImage": mainImage {
    ${imageFragment}
    ,"alt": ${localeField("alt")}
  },
  "tags": coalesce(tags, []),
  "problem": ${localeField("problem")},
  "solution": ${localeField("solution")},
  "result": ${localeField("result")},
  "metrics": coalesce(metrics[]{
    value,
    "label": ${localeField("label")}
  }, []),
  "detailSummary": ${localeField("detailSummary")},
  "highlights": coalesce(highlights[]{
    "text": select($locale == "it" => it, en)
  }, []),
  externalLink,
  featured,
  publishedAt,
  "updatedAt": _updatedAt,
  "seo": {
    "title": ${localeField("seo.title")},
    "description": ${localeField("seo.description")},
    "image": seo.image { ${imageFragment} },
    "noIndex": seo.noIndex
  }
}`);

export const POSTS_QUERY = defineQuery(/* groq */ `
*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  "id": _id,
  "title": ${localeField("title")},
  "slug": slug.current,
  "excerpt": ${localeField("excerpt")},
  "coverImage": coverImage {
    ${imageFragment}
    ,"alt": ${localeField("alt")}
  },
  "tags": coalesce(tags, []),
  publishedAt
}`);

export const POST_SLUGS_QUERY = defineQuery(/* groq */ `
*[_type == "post" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`);

export const POST_BY_SLUG_QUERY = defineQuery(/* groq */ `
*[_type == "post" && slug.current == $slug][0] {
  "id": _id,
  "title": ${localeField("title")},
  "slug": slug.current,
  "excerpt": ${localeField("excerpt")},
  "coverImage": coverImage {
    ${imageFragment}
    ,"alt": ${localeField("alt")}
  },
  "tags": coalesce(tags, []),
  "body": ${localeField("body")},
  publishedAt,
  "updatedAt": _updatedAt,
  "seo": {
    "title": ${localeField("seo.title")},
    "description": ${localeField("seo.description")},
    "image": seo.image { ${imageFragment} },
    "noIndex": seo.noIndex
  }
}`);
