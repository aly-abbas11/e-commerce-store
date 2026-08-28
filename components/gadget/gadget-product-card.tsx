import Image from "next/image";
import Link from "next/link";

import { gadgetImageSrc } from "@/components/gadget/gadget-image";
import { salePercent } from "@/components/gadget/gadget-sale";
import { product2Href } from "@/lib/gadget-preview";
import { PRODUCT_IMAGE } from "@/lib/product-image";
import { getStockState } from "@/lib/stock";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function GadgetProductCard({ product }: { product: Product }) {
  const image = gadgetImageSrc(product, PRODUCT_IMAGE.card);
  const stock = getStockState(product.stockStatus);
  const href = product2Href(product.slug);
  const off = salePercent(product.price, product.compareAtPrice);
  const priceNow = formatPrice(product.price);
  const priceWas = product.compareAtPrice ? formatPrice(product.compareAtPrice) : "";

  return (
    <article className="flex flex-col bg-white">
      <Link href={href} prefetch={false} className="relative block aspect-square overflow-hidden bg-zinc-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            quality={90}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-2"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-zinc-400">No image</span>
        )}
        {stock.soldOut ? (
          <span className="absolute left-2 top-2 bg-zinc-950 px-2 py-1 text-[10px] font-black uppercase text-white">
            Sold out
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 border-x border-b border-zinc-200 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {product.category.replace("-", " ")}
        </p>
        <Link href={href} prefetch={false} className="line-clamp-2 min-h-11 text-sm font-bold leading-snug hover:underline">
          {product.name}
        </Link>
        <p
          className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
          aria-label={off ? `${priceNow}, was ${priceWas}, ${off} percent off` : priceNow}
        >
          <span className="text-lg font-black">{priceNow}</span>
          {off && product.compareAtPrice ? (
            <>
              <span className="text-sm text-zinc-400 line-through">{priceWas}</span>
              <span className="text-xs font-black text-zinc-950">–{off}%</span>
            </>
          ) : null}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center justify-center bg-zinc-950 text-xs font-black uppercase tracking-wide text-white hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
        >
          {stock.soldOut ? "View" : "Shop"}
        </Link>
      </div>
    </article>
  );
}
