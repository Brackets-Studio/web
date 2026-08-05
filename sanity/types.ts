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
