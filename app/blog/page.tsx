import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, User } from "lucide-react";

import { fetchBlogPosts } from "@/lib/db/store";
import { isDemoSession } from "@/lib/demo";
import { imageUrl } from "@/lib/sanity/image";
import type { Page } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog & Guides",
  description: "Guides, news and tips from our team.",
  openGraph: {
    title: "Blog & Guides | VoltGear",
    description: "Guides, news and tips from our team.",
    type: "website",
  },
};

export const revalidate = 60;

export default async function BlogPage() {
  let posts: Page[] = [];
  try {
    posts = await fetchBlogPosts(isDemoSession());
  } catch {
    posts = [];
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Blog
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Guides, News &amp; Tips
        </h1>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                {post.coverImage ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={imageUrl(post.coverImage, { w: 800 })}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No cover image
                  </div>
                )}
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {post.author && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                  )}
                </div>
                <h2 className="font-semibold leading-snug group-hover:text-primary">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No blog posts yet. Create posts in Sanity Studio (Page Type: Blog
          Post).
        </p>
      )}
    </div>
  );
}
