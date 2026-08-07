import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getTranslations } from "next-intl/server";
import { StackedSection } from "@/components/layout/stacked-section";
import { Monogram } from "@/components/ui/monogram";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { sanityFetch, client } from "@/sanity/client";
import { POST_BY_SLUG_QUERY, POST_SLUGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { PostDetail, SanityImage } from "@/sanity/types";
import { siteConfig } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(POST_SLUGS_QUERY);
  return routing.locales.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

async function getPost(locale: string, slug: string) {
  return sanityFetch<PostDetail | null>({
    query: POST_BY_SLUG_QUERY,
    params: { locale, slug },
    tags: ["post"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) return {};

  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  const image = post.seo?.image ?? post.coverImage;
  const imageUrl = image?.asset ? urlFor(image).width(1200).height(630).fit("crop").url() : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/blog/${slug}`])),
    },
    robots: post.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function postJsonLd(locale: string, slug: string, post: PostDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${siteConfig.url}/${locale}/blog/${slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    image: post.coverImage?.asset
      ? urlFor(post.coverImage).width(1200).height(630).fit("crop").url()
      : undefined,
  };
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 text-2xl font-semibold tracking-[-0.01em] text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 text-xl font-semibold tracking-[-0.01em] text-foreground">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-brand pl-4 text-foreground-muted italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="mt-4 text-base leading-relaxed text-foreground-muted">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-inside list-disc space-y-4 text-foreground-muted">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-inside list-decimal space-y-2 text-foreground-muted">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="text-foreground-muted mt-1">{children}</li>
    ),
    number: ({ children }) => (
      <li className="text-foreground-muted mt-1">{children}</li>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-brand underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: { value: SanityImage }) =>
      value?.asset ? (
        <span className="mt-6 block overflow-hidden rounded-lg border border-border">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt ?? ""}
            width={1200}
            height={Math.round(
              (1200 * (value.asset.metadata?.dimensions.height ?? 630)) /
                (value.asset.metadata?.dimensions.width ?? 1200)
            )}
            className="w-full object-cover"
          />
        </span>
      ) : null,
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [post, t] = await Promise.all([getPost(locale, slug), getTranslations("blog")]);

  if (!post) notFound();

  const imageUrl = post.coverImage?.asset
    ? urlFor(post.coverImage).width(1600).height(1000).fit("crop").url()
    : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd(locale, slug, post)) }}
      />
      <StackedSection className="rounded-t-none!">
        <div className="mx-auto w-full max-w-6xl sm:px-6 sm:pt-8">
          <div className="relative aspect-21/9 w-full overflow-hidden sm:aspect-16/6 sm:rounded-2xl sm:border sm:border-border">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={post.coverImage?.alt ?? post.title}
                fill
                priority
                sizes="(min-width: 640px) 72rem, 100vw"
                className="object-cover object-top"
              />
            ) : (
              <Monogram title={post.title} />
            )}
            <div className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-background via-background/20 to-transparent sm:hidden" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background via-background/20 to-transparent sm:hidden" />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-sm text-foreground-muted transition-colors hover:text-brand"
          >
            <ArrowLeft size={16} />
            {t("backToBlog")}
          </Link>

          <time dateTime={post.publishedAt} className="mt-6 block font-mono text-xs text-foreground-muted">
            {new Date(post.publishedAt).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>

          <h1 className="mt-3 text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-foreground-muted">{post.excerpt}</p>

          <div className="mt-10">
            <PortableText value={post.body} components={portableTextComponents} />
          </div>
        </div>
      </StackedSection>
    </>
  );
}
