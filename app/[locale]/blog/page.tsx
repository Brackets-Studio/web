import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StackedSection } from "@/components/layout/stacked-section";
import { Reveal } from "@/components/ui/reveal";
import { Monogram } from "@/components/ui/monogram";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { sanityFetch } from "@/sanity/client";
import { POSTS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import type { PostListItem } from "@/sanity/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/blog`])),
    },
  };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getTranslations("blog");

  const posts = await sanityFetch<PostListItem[]>({
    query: POSTS_QUERY,
    params: { locale },
    tags: ["post"],
  });

  return (
    <>
      <Navbar />
      <StackedSection>
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mx-auto mb-6 w-fit tracking-wider uppercase font-mono text-sm bg-muted/50 shadow-xl shadow-border/70 px-3 py-1 rounded-full border border-border">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-foreground-muted">{t("subtitle")}</p>
          </Reveal>

          {posts.length === 0 ? (
            <Reveal className="mx-auto mt-16 max-w-md rounded-lg border border-border bg-background-elevated p-8 text-center">
              <p className="text-base font-semibold text-foreground">{t("empty.title")}</p>
              <p className="mt-2 text-sm text-foreground-muted">{t("empty.body")}</p>
              <Link
                href="/#case-study"
                className="mt-6 inline-flex items-center rounded-[100px] border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-brand"
              >
                {t("backToBlog")}
              </Link>
            </Reveal>
          ) : (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal key={post.id} index={index}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-elevated shadow-sm transition-colors hover:border-brand"
                  >
                    <div className="relative aspect-16/10 w-full overflow-hidden">
                      {post.coverImage?.asset ? (
                        <Image
                          src={urlFor(post.coverImage).width(800).height(500).fit("crop").url()}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <Monogram title={post.title} />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <time
                        dateTime={post.publishedAt}
                        className="font-mono text-xs text-foreground-muted"
                      >
                        {new Date(post.publishedAt).toLocaleDateString(locale, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                      <h2 className="mt-2 text-lg font-semibold tracking-[-0.01em] text-foreground">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm text-foreground-muted">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </StackedSection>
      <Footer />
    </>
  );
}
