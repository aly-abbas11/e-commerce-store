import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import { imageUrl } from "@/lib/sanity/image";
import type { PortableTextBlock } from "@portabletext/types";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-8 text-2xl font-bold tracking-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 text-xl font-bold tracking-tight">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="mt-4 leading-relaxed text-muted-foreground">{children}</p>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="font-medium text-primary underline underline-offset-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dimensions = value?.dimensions as
        | { width?: number; height?: number }
        | undefined;
      const src = imageUrl(value, { w: 900 });
      if (dimensions?.width && dimensions?.height) {
        return (
          <Image
            src={src}
            alt=""
            width={dimensions.width}
            height={dimensions.height}
            className="my-6 h-auto w-full rounded-lg border"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        );
      }
      return (
        <div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <Image src={src} alt="" fill className="object-contain" sizes="700px" />
        </div>
      );
    },
  },
};

export function RichText({ blocks }: { blocks: PortableTextBlock[] }) {
  return <PortableText value={blocks} components={components} />;
}