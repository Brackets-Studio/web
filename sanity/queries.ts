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

export const VERTICAL_SLUGS_QUERY = defineQuery(/* groq */ `
*[_type == "vertical" && active == true && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt,
  "noIndex": seo.noIndex
}`);

/**
 * Merge del documento verticale con le impostazioni condivise (`verticalDefaults`).
 *
 * Il prezzo si fonde CAMPO PER CAMPO, non a livello di oggetto: se una nicchia
 * sovrascrive il solo importo, deve continuare a ereditare le voci incluse. Un
 * `coalesce(price, $defaults.price)` invece le azzererebbe in silenzio, e nessuno
 * se ne accorgerebbe finché non guarda la pagina.
 *
 * Gli array (obiezioni) si fondono invece a livello di oggetto: un elenco
 * parziale non ha senso, o vale quello della nicchia o vale quello condiviso.
 */
export const VERTICAL_BY_SLUG_QUERY = defineQuery(/* groq */ `
*[_type == "vertical" && slug.current == $slug && active == true][0] {
  // Prima passata: si porta dietro il documento intero (...) più le
  // impostazioni condivise, così la proiezione vera qui sotto può fondere i due
  // senza rieseguire la sottoquery a ogni campo.
  ...,
  "defaults": *[_id == "verticalDefaults"][0]
} {
  "id": _id,
  name,
  "slug": slug.current,
  serviceType,
  "hero": {
    "eyebrow": hero.eyebrow,
    "title": hero.title,
    "subtitle": hero.subtitle,
    "image": hero.image { ${imageFragment}, alt },
    // Vuoto = si riusa l'importo rateizzato, così i due non possono divergere.
    "priceDisplay": coalesce(hero.priceDisplay, price.installments.amount, defaults.price.installments.amount),
    "priceNote": hero.priceNote,
    "ctaLabel": coalesce(defaults.contact.ctaLabel, "Chiamami ora"),
    "ctaWhatsappLabel": coalesce(defaults.contact.ctaWhatsappLabel, "Scrivimi su WhatsApp"),
    "callbackTitle": defaults.contact.callbackTitle,
    "callbackText": defaults.contact.callbackText
  },
  "trust": coalesce(defaults.trust.items, []),
  "vibeImages": coalesce(vibeImages[]{
    ${imageFragment}
    ,alt
  }, []),
  "proof": {
    "title": proof.title,
    "subtitle": proof.subtitle,
    "intro": proof.intro,
    "anonymousCaption": proof.anonymousCaption,
    // Gli screenshot senza immagine renderizzavano un telefono vuoto in pagina:
    // qui non arrivano proprio, a prescindere da com'è messo il documento.
    "screenshots": coalesce(proof.screenshots[defined(image.asset)]{
      "image": image { ${imageFragment} },
      clientName,
      consentGiven,
      href
    }, [])
  },
  "benefits": {
    "title": benefits.title,
    "items": coalesce(benefits.items, [])
  },
  "process": {
    "title": process.title,
    "steps": coalesce(process.steps, [])
  },
  "price": {
    "title": coalesce(price.title, defaults.price.title),
    "oneTime": {
      "label": coalesce(price.oneTime.label, defaults.price.oneTime.label),
      "amount": coalesce(price.oneTime.amount, defaults.price.oneTime.amount),
      "includes": coalesce(price.oneTime.includes, defaults.price.oneTime.includes),
      "features": coalesce(price.oneTime.features, defaults.price.oneTime.features, [])
    },
    "installments": {
      "label": coalesce(price.installments.label, defaults.price.installments.label),
      "amount": coalesce(price.installments.amount, defaults.price.installments.amount),
      "note": coalesce(price.installments.note, defaults.price.installments.note)
    }
  },
  "objections": {
    "title": coalesce(objections.title, defaults.objections.title),
    "items": coalesce(objections.items, defaults.objections.items, [])
  },
  "about": { "text": coalesce(about.text, defaults.about.text) },
  "closingCta": {
    "title": coalesce(closingCta.title, defaults.closingCta.title),
    "text": coalesce(closingCta.text, defaults.closingCta.text)
  },
  "sectionLabels": {
    "proof": coalesce(defaults.sectionLabels.proof, "Lavori veri"),
    "benefits": coalesce(defaults.sectionLabels.benefits, "Perché conviene"),
    "process": coalesce(defaults.sectionLabels.process, "Come funziona"),
    "price": coalesce(defaults.sectionLabels.price, "Quanto costa"),
    "cases": coalesce(defaults.sectionLabels.cases, "Un esempio vero"),
    "objections": coalesce(defaults.sectionLabels.objections, "Domande frequenti"),
    "about": coalesce(defaults.sectionLabels.about, "Chi sono")
  },
  "theme": {
    "preset": theme.preset,
    "accentOverride": theme.accentOverride.hex
  },
  "relatedCaseStudies": coalesce(relatedCaseStudies[]->{
    "id": _id,
    name,
    "slug": slug.current,
    "excerpt": excerpt.it,
    "result": result.it,
    "tags": coalesce(tags, []),
    "mainImage": mainImage {
      ${imageFragment}
      ,"alt": alt.it
    }
  }, []),
  "seo": {
    "title": seo.title,
    "description": seo.description,
    "image": seo.image { ${imageFragment} },
    "noIndex": seo.noIndex
  },
  "updatedAt": _updatedAt
}`);

export const SOCIAL_PROOF_QUERY = defineQuery(/* groq */ `
*[_id == "socialProof"][0] {
  "heading": ${localeField("heading")},
  "logos": coalesce(logos[]{
    "image": image { ${imageFragment} },
    "alt": ${localeField("alt")},
    name,
    href
  }, [])
}`);

export const SERVICES_QUERY = defineQuery(/* groq */ `
*[_type == "service" && defined(slug.current)] | order(order asc) {
  "id": _id,
  "title": ${localeField("title")},
  "slug": slug.current,
  "eyebrow": ${localeField("eyebrow")},
  "shortDescription": ${localeField("shortDescription")},
  "tags": coalesce(tags[]{
    "text": select($locale == "it" => it, en)
  }, []),
  "heroImage": heroImage {
    ${imageFragment}
    ,"alt": ${localeField("alt")}
  },
  "detail": {
    "summary": ${localeField("detail.summary")},
    "highlights": coalesce(detail.highlights[]{
      "text": select($locale == "it" => it, en)
    }, [])
  }
}`);

export const SERVICE_SLUGS_QUERY = defineQuery(/* groq */ `
*[_type == "service" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`);

/**
 * Il prezzo non vive sul documento `service`: viene agganciato qui dalle
 * "Impostazioni prezzi" cercando la voce la cui `service` reference punta a
 * questo documento (`service._ref == ^._id`) — stesso schema a due passate
 * delle vertical (vedi VERTICAL_BY_SLUG_QUERY), per non rieseguire la
 * sottoquery a ogni campo.
 */
export const SERVICE_BY_SLUG_QUERY = defineQuery(/* groq */ `
*[_type == "service" && slug.current == $slug][0] {
  ...,
  "pricingMatch": *[_id == "pricingSettings"][0].services[service._ref == ^._id][0]
} {
  "id": _id,
  "title": ${localeField("title")},
  "slug": slug.current,
  "eyebrow": ${localeField("eyebrow")},
  "shortDescription": ${localeField("shortDescription")},
  "tags": coalesce(tags[]{
    "text": select($locale == "it" => it, en)
  }, []),
  "heroImage": heroImage {
    ${imageFragment}
    ,"alt": ${localeField("alt")}
  },
  "detail": {
    "summary": ${localeField("detail.summary")},
    "highlights": coalesce(detail.highlights[]{
      "text": select($locale == "it" => it, en)
    }, [])
  },
  "body": ${localeField("body")},
  "price": select(
    defined(pricingMatch) => {
      "basePrice": pricingMatch.basePrice,
      "baseTimelineWeeks": pricingMatch.baseTimelineWeeks
    },
    null
  ),
  "seo": {
    "title": ${localeField("seo.title")},
    "description": ${localeField("seo.description")},
    "image": seo.image { ${imageFragment} },
    "noIndex": seo.noIndex
  },
  "updatedAt": _updatedAt
}`);

/**
 * Fonte unica dei prezzi dello studio. `services[]`/`quoteQuestions[]`
 * arrivano nell'ordine dei rispettivi campi `order` — un editor può
 * riordinare il preventivatore senza toccare codice.
 */
export const PRICING_SETTINGS_QUERY = defineQuery(/* groq */ `
*[_id == "pricingSettings"][0] {
  // "services" qui sotto tiene solo i pacchetti con un Servizio ancora
  // collegato: se un documento Servizio viene cancellato, la voce sparisce
  // dal calcolatore invece di mostrare un pacchetto senza nome.
  "services": coalesce(services[defined(service->slug.current)] | order(order asc) {
    "key": service->slug.current,
    "name": ${localeField("service->title")},
    basePrice,
    baseTimelineWeeks,
    "description": ${localeField("service->shortDescription")},
    "features": coalesce(features[]{
      "text": select($locale == "it" => it, en)
    }, [])
  }, []),
  "quoteQuestions": coalesce(quoteQuestions[]{
    key,
    "label": ${localeField("label")},
    "options": coalesce(options[]{
      key,
      "label": ${localeField("label")},
      "priceMultiplier": coalesce(priceMultiplier, 1),
      "priceAdd": coalesce(priceAdd, 0),
      "timelineAddWeeks": coalesce(timelineAddWeeks, 0)
    }, [])
  }, []),
  "quoteSettings": {
    "rangeSpreadPercent": coalesce(quoteSettings.rangeSpreadPercent, 15),
    "roundTo": coalesce(quoteSettings.roundTo, 100),
    "resultTitle": ${localeField("quoteSettings.resultTitle")},
    "resultDisclaimer": ${localeField("quoteSettings.resultDisclaimer")},
    "ctaLabel": ${localeField("quoteSettings.ctaLabel")}
  }
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
