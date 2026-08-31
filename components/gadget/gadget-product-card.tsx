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
    <article className="flex flex-col rounded-xl border border-[#eaeaea] bg-white">
      <Link
        href={href}
        prefetch={false}
        className="relative block aspect-square overflow-hidden rounded-t-xl bg-[#fafafa]"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            quality={90}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-[#7d7d7d]">No image</span>
        )}
        {stock.soldOut ? (
          <span className="absolute left-2 top-2 rounded-md bg-[#171717] px-2 py-1 text-[10px] font-bold uppercase text-white">
            Sold out
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f766e]">
          {product.category.replace("-", " ")}
        </p>
        <Link
          href={href}
          prefetch={false}
          className="line-clamp-2 min-h-11 text-sm font-semibold leading-snug text-[#171717] hover:underline"
        >
          {product.name}
        </Link>
        <p
          className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
          aria-label={off ? `${priceNow}, was ${priceWas}, ${off} percent off` : priceNow}
        >
          <span className="text-base font-bold text-[#171717]">{priceNow}</span>
          {off && product.compareAtPrice ? (
            <>
              <span className="text-sm text-[#999] line-through">{priceWas}</span>
              <span className="text-xs font-bold text-[#171717]">–{off}%</span>
            </>
          ) : null}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-[#171717] text-xs font-semibold text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
        >
          {stock.soldOut ? "View" : "Shop now"}
        </Link>
      </div>
    </article>
  );
}
