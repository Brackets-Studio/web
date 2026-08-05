import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { client } from "@/sanity/client";
import { CASE_STUDY_SLUGS_QUERY, POST_SLUGS_QUERY } from "@/sanity/queries";

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookie-policy", priority: 0.3, changeFrequency: "yearly" },
];

function slugEntries(
  basePath: string,
  items: { slug: string; updatedAt: string }[],
  priority: number
): MetadataRoute.Sitemap {
  return items.flatMap(({ slug, updatedAt }) =>
    routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${basePath}/${slug}`,
      lastModified: new Date(updatedAt),
      changeFrequency: "monthly" as const,
      priority: locale === routing.defaultLocale ? priority : priority * 0.9,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteConfig.url}/${l}${basePath}/${slug}`])
        ),
      },
    }))
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries = STATIC_PATHS.flatMap(({ path, priority, changeFrequency }) =>
    routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority: locale === routing.defaultLocale ? priority : priority * 0.9,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteConfig.url}/${l}${path}`])
        ),
      },
    }))
  );

  const [caseStudies, posts] = await Promise.all([
    client.fetch<{ slug: string; updatedAt: string }[]>(CASE_STUDY_SLUGS_QUERY),
    client.fetch<{ slug: string; updatedAt: string }[]>(POST_SLUGS_QUERY),
  ]);

  return [
    ...staticEntries,
    ...slugEntries("/work", caseStudies, 0.7),
    ...slugEntries("/blog", posts, 0.5),
  ];
}
