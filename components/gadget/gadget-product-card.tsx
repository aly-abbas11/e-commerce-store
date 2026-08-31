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
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--g-line)] bg-[var(--g-white)] shadow-[0_1px_0_rgba(26,26,26,0.04)]">
      <Link
        href={href}
        prefetch={false}
        className="relative block aspect-square overflow-hidden bg-[var(--g-cream-deep)]"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            quality={90}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3 transition duration-500 hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-[var(--g-taupe)]">
            No image
          </span>
        )}
        {stock.soldOut ? (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--g-forest)] px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--g-white)]">
            Sold out
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--g-sage)]">
          {product.category.replace("-", " ")}
        </p>
        <Link
          href={href}
          prefetch={false}
          className="line-clamp-2 min-h-11 text-sm font-semibold leading-snug text-[var(--g-charcoal)] hover:underline"
        >
          {product.name}
        </Link>
        <p
          className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
          aria-label={off ? `${priceNow}, was ${priceWas}, ${off} percent off` : priceNow}
        >
          <span className="text-base font-bold text-[var(--g-charcoal)]">{priceNow}</span>
          {off && product.compareAtPrice ? (
            <>
              <span className="text-sm text-[var(--g-taupe)] line-through">{priceWas}</span>
              <span className="text-xs font-bold text-[var(--g-forest)]">–{off}%</span>
            </>
          ) : null}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--g-forest)] text-xs font-semibold uppercase tracking-wide text-[var(--g-white)] transition hover:bg-[var(--g-forest-mid)]"
        >
          {stock.soldOut ? "View" : "Shop now"}
        </Link>
      </div>
    </article>
  );
}
