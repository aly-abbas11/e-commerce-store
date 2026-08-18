import Image from "next/image";
import { ArrowRight, Check, Lightbulb, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/sections/contact-form";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { ProductCard } from "@/components/product/product-card";
import { imageUrl } from "@/lib/sanity/image";
import type { ContentBlock } from "@/lib/types";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="max-w-3xl">
      {blocks.map((block, i) => {
        switch (block._type) {
          case "heading":
            if (block.level === "h4") {
              return (
                <h4
                  key={i}
                  className="mt-6 text-lg font-bold tracking-tight"
                >
                  {block.text}
                </h4>
              );
            }
            return block.level === "h3" ? (
              <h3
                key={i}
                className="mt-8 text-xl font-bold tracking-tight"
              >
                {block.text}
              </h3>
            ) : (
              <h2
                key={i}
                className="mt-8 text-2xl font-bold tracking-tight"
              >
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p
                key={i}
                className="mt-4 leading-relaxed text-muted-foreground"
              >
                {block.text}
              </p>
            );
          case "list":
            if (!block.items?.length) return null;
            return block.type === "number" ? (
              <ol
                key={i}
                className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground"
              >
                {block.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <ul
                key={i}
                className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground"
              >
                {block.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <div
                key={i}
                className="mt-6 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
              >
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  {block.title && (
                    <p className="font-semibold">{block.title}</p>
                  )}
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {block.text}
                  </p>
                </div>
              </div>
            );
          case "relatedProducts":
            if (!block.products?.length) return null;
            return (
              <div key={i} className="mt-10">
                <p className="flex items-center gap-2 text-lg font-bold tracking-tight">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  {block.heading || "Related products"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <Check className="mr-1 inline h-3.5 w-3.5 text-primary" />
                  Pair them with your order — available in the store.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {block.products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            );
          case "inlineImage":
            if (!block.image) return null;
            {
              const src = imageUrl(block.image, { w: 1000 });
              const d = block.dimensions;
              return d?.width && d?.height ? (
                <Image
                  key={i}
                  src={src}
                  alt=""
                  width={d.width}
                  height={d.height}
                  className="my-6 h-auto w-full rounded-xl border"
                  sizes="(max-width: 768px) 100vw, 700px"
                />
              ) : (
                <div
                  key={i}
                  className="relative my-6 aspect-video w-full overflow-hidden rounded-xl border bg-muted"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="700px"
                  />
                </div>
              );
            }
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-6 border-l-4 border-primary pl-4 text-lg font-medium italic text-foreground"
              >
                {block.text}
              </blockquote>
            );
          case "cta":
            return block.label && block.href ? (
              <div key={i} className="mt-8">
                <Button asChild size="lg">
                  <a href={block.href}>
                    {block.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : null;
          case "faq":
            return block.items?.length ? (
              <div key={i} className="mt-8">
                <FAQAccordion items={block.items} />
              </div>
            ) : null;
          case "contactForm":
            return (
              <div key={i} className="mt-8">
                <ContactForm heading={block.heading} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
