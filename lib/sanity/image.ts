import type { SanityImageSource } from "@sanity/image-url";

import { urlFor } from "@/lib/sanity/client";

export function imageUrl(
  source: SanityImageSource,
  { w = 800, h, quality = 80 }: { w?: number; h?: number; quality?: number } = {}
): string {
  if (!source) return "";
  let url = urlFor(source).auto("format").quality(quality).width(w);
  if (h) url = url.height(h);
  return url.url();
}
