import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, User } from "lucide-react";

import { ContentBlocks } from "@/components/sections/content-blocks";
import { fetchPageBySlug, fetchPageSlugs } from "@/lib/db/store";
import { isDemoSession } from "@/lib/demo";
import { imageUrl } from "@/lib/sanity/image";
import type { Page } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await fetchPageSlugs();
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let page: Page | null = null;
  try {
    page = await fetchPageBySlug(params.slug, isDemoSession());
  } catch {
    page = null;
  }
  if (!page) return {};
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.excerpt,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.seo?.title || page.title,
      description: page.seo?.description || page.excerpt,
      type: page.pageType === "blog" ? "article" : "website",
      images: page.coverImage ? [imageUrl(page.coverImage, { w: 800 })] : [],
    },
  };
}

export default async function StaticPage({
  params,
}: {
  params: { slug: string };
}) {
  let page: Page | null = null;
  try {
    page = await fetchPageBySlug(params.slug, isDemoSession());
  } catch {
    page = null;
  }

  if (!page) notFound();

  const isBlog = page.pageType === "blog";

  return (
    <article className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {isBlog && page.publishedAt && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {new Date(page.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {page.author && (
              <>
                <span>·</span>
                <User className="h-4 w-4" />
                {page.author}
              </>
            )}
          </p>
        )}

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          {page.title}
        </h1>

        {page.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground">{page.excerpt}</p>
        )}

        {page.coverImage && (
          <div className="relative my-8 aspect-[16/9] w-full overflow-hidden rounded-xl border">
            <Image
              src={imageUrl(page.coverImage, { w: 1200 })}
              alt={page.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {page.sections && page.sections.length > 0 ? (
          <ContentBlocks blocks={page.sections} />
        ) : (
          <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            This page is empty. Add content blocks in Sanity Studio.
          </p>
        )}
      </div>
    </article>
  );
}
