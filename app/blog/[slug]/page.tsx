import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Clock, User } from "lucide-react";

import { ContentBlocks } from "@/components/sections/content-blocks";
import { fetchFromSanity } from "@/lib/sanity/client";
import { imageUrl } from "@/lib/sanity/image";
import { pageBySlugQuery, blogPostsQuery } from "@/lib/sanity/queries";
import type { ContentBlock, Page } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await fetchFromSanity<Page[]>(blogPostsQuery);
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

function readingMinutes(blocks: ContentBlock[] | undefined): number {
  if (!blocks?.length) return 0;
  const text = blocks
    .map((b) => {
      if (b._type === "paragraph" || b._type === "callout" || b._type === "quote")
        return b.text ?? "";
      if (b._type === "list") return (b.items ?? []).join(" ");
      if (b._type === "heading") return b.text ?? "";
      return "";
    })
    .join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let post: Page | null = null;
  try {
    post = await fetchFromSanity<Page | null>(pageBySlugQuery, {
      slug: params.slug,
    });
  } catch {
    post = null;
  }
  if (!post) return {};
  const cover = post.coverImage ? imageUrl(post.coverImage, { w: 1200 }) : null;
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    keywords: post.keywords?.length ? post.keywords.join(", ") : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post: Page | null = null;
  try {
    post = await fetchFromSanity<Page | null>(pageBySlugQuery, {
      slug: params.slug,
    });
  } catch {
    post = null;
  }

  if (!post || post.pageType !== "blog") notFound();

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";
  const mins = readingMinutes(post.sections);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voltique.example.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    image: post.coverImage ? imageUrl(post.coverImage, { w: 1200 }) : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: post.author || "Voltique Team" },
    publisher: {
      "@type": "Organization",
      name: "Voltique",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    keywords: post.keywords?.join(", "),
    wordCount: readingMinutes(post.sections) * 200,
  };

  return (
    <article className="container mx-auto px-4 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1 text-sm text-muted-foreground">
            <li>
              <a href="/" className="hover:text-foreground">
                Home
              </a>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <a href="/blog" className="hover:text-foreground">
                Blog & Guides
              </a>
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>

        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <div
          className={cn(
            "mt-6 flex flex-wrap items-center gap-3 border-y py-4",
            post.coverImage ? "border-y" : "border-b"
          )}
        >
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary"
          >
            {(post.author || "V")[0].toUpperCase()}
          </span>
          <div className="text-sm">
            <p className="flex items-center gap-1.5 font-semibold">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {post.author || "Voltique Team"}
            </p>
            <p className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {publishedDate}
              </span>
              {mins > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {mins} min read
                </span>
              )}
            </p>
          </div>
        </div>

        {post.coverImage && (
          <div className="relative my-8 aspect-[16/9] w-full overflow-hidden rounded-xl border">
            <Image
              src={imageUrl(post.coverImage, { w: 1200 })}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {post.sections && post.sections.length > 0 ? (
          <ContentBlocks blocks={post.sections} />
        ) : (
          <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            This post has no content yet.
          </p>
        )}

        <div className="mt-12 border-t pt-6">
          <a
            href="/blog"
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
          >
            ← Back to all guides
          </a>
        </div>
      </div>
    </article>
  );
}
