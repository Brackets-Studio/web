import type { PortableTextBlock } from "@portabletext/types";

export type SanityImage = {
  asset: {
    _id: string;
    url: string;
    metadata: {
      lqip: string | null;
      dimensions: { width: number; height: number };
    };
  } | null;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt: string | null;
};

export type CaseStudyMetric = {
  value: string;
  label: string;
};

export type CaseStudyListItem = {
  id: string;
  name: string;
  slug: string;
  excerpt: string;
  mainImage: SanityImage | null;
  tags: string[];
  problem: string;
  solution: string;
  result: string;
  metrics: CaseStudyMetric[];
  detailSummary: string;
  highlights: { text: string }[];
  externalLink: string | null;
  featured: boolean;
  updatedAt: string;
};

export type CaseStudySEO = {
  title: string | null;
  description: string | null;
  image: SanityImage | null;
  noIndex: boolean;
};

export type CaseStudyDetail = CaseStudyListItem & {
  publishedAt: string | null;
  seo: CaseStudySEO;
};

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  avatar: SanityImage | null;
  relatedCaseStudySlug: string | null;
};

export type VerticalHero = {
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  image: SanityImage | null;
  priceDisplay: string | null;
  priceNote: string | null;
  /** Da `verticalDefaults.contact` — la query garantisce un fallback. */
  ctaLabel: string;
  ctaWhatsappLabel: string;
  callbackTitle: string | null;
  callbackText: string | null;
};

/**
 * La query filtra gli screenshot senza immagine (`[defined(image.asset)]`),
 * quindi `image` qui è sempre valorizzata: un mockup vuoto non arriva in pagina.
 */
export type VerticalScreenshot = {
  image: SanityImage;
  clientName: string | null;
  consentGiven: boolean;
  href: string | null;
};

export type VerticalTrustItem = { title: string; text: string };

/** Etichette delle sezioni, con fallback garantito dalla query. */
export type VerticalSectionLabels = {
  proof: string;
  benefits: string;
  process: string;
  price: string;
  cases: string;
  objections: string;
  about: string;
};

export type VerticalBenefit = { title: string; text: string };
export type VerticalObjection = { fear: string; answer: string };

export type VerticalPrice = {
  title: string | null;
  oneTime: {
    label: string | null;
    amount: string | null;
    includes: string | null;
    features: string[];
  } | null;
  installments: {
    label: string | null;
    amount: string | null;
    note: string | null;
  } | null;
};

export type VerticalRelatedCaseStudy = {
  id: string;
  name: string;
  slug: string;
  excerpt: string | null;
  result: string | null;
  tags: string[];
  mainImage: SanityImage | null;
};

export type VerticalStep = { title: string; text: string };

export type VerticalDetail = {
  id: string;
  name: string;
  slug: string;
  serviceType: string;
  hero: VerticalHero;
  trust: VerticalTrustItem[];
  sectionLabels: VerticalSectionLabels;
  vibeImages: SanityImage[];
  proof: {
    title: string | null;
    subtitle: string | null;
    intro: string | null;
    anonymousCaption: string | null;
    screenshots: VerticalScreenshot[];
  };
  benefits: { title: string | null; items: VerticalBenefit[] };
  process: { title: string | null; steps: VerticalStep[] };
  price: VerticalPrice;
  objections: { title: string | null; items: VerticalObjection[] };
  about: { text: string | null } | null;
  closingCta: { title: string | null; text: string | null } | null;
  /** `preset` è un `PresetId` di `lib/verticals/presets.ts`; ignoti → "neutro". */
  theme: { preset: string | null; accentOverride: string | null } | null;
  relatedCaseStudies: VerticalRelatedCaseStudy[];
  seo: CaseStudySEO;
  updatedAt: string;
};

export type SocialProofLogo = {
  image: SanityImage | null;
  alt: string | null;
  name: string | null;
  href: string | null;
};

export type SocialProof = {
  heading: string | null;
  logos: SocialProofLogo[];
};

export type ServiceListItem = {
  id: string;
  title: string;
  slug: string;
  eyebrow: string | null;
  shortDescription: string;
  tags: { text: string }[];
  heroImage: SanityImage | null;
  detail: { summary: string | null; highlights: { text: string }[] };
};

/**
 * `price` è null quando nessuna voce di `pricingSettings.services[]` ha una
 * `key` uguale allo slug: il teaser "a partire da" viene semplicemente omesso
 * dalla pagina in quel caso.
 */
export type ServicePrice = { basePrice: number; baseTimelineWeeks: number };

export type ServiceDetail = ServiceListItem & {
  body: PortableTextBlock[] | null;
  price: ServicePrice | null;
  seo: CaseStudySEO;
  updatedAt: string;
};

export type PricingService = {
  key: string;
  name: string;
  basePrice: number;
  baseTimelineWeeks: number;
  description: string | null;
  features: { text: string }[];
};

export type QuoteOption = {
  key: string;
  label: string;
  priceMultiplier: number;
  priceAdd: number;
  timelineAddWeeks: number;
};

export type QuoteQuestion = {
  key: string;
  label: string;
  options: QuoteOption[];
};

export type PricingSettings = {
  services: PricingService[];
  quoteQuestions: QuoteQuestion[];
  quoteSettings: {
    rangeSpreadPercent: number;
    roundTo: number;
    resultTitle: string | null;
    resultDisclaimer: string | null;
    ctaLabel: string | null;
  };
};

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: SanityImage | null;
  tags: string[];
  publishedAt: string;
};

export type PostDetail = Omit<PostListItem, "publishedAt"> & {
  body: PortableTextBlock[];
  publishedAt: string;
  updatedAt: string;
  seo: CaseStudySEO;
};
