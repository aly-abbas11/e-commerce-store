"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { FALLBACK_SHOP_TYPES, shopTypeLinks, type ShopType } from "@/lib/categories";
import { imageUrl } from "@/lib/sanity/image";
import type { SiteSettings } from "@/lib/types";

export function GadgetNavbar({
  settings,
  shopTypes = FALLBACK_SHOP_TYPES,
}: {
  settings: SiteSettings | null;
  shopTypes?: ShopType[];
}) {
  const { count, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const links = shopTypeLinks(shopTypes);
  const brandName = settings?.brandName || "VoltGear";
  const logoUrl = settings?.logo ? imageUrl(settings.logo, { w: 256 }) : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#eaeaea] bg-white text-[#171717]">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        <Link href="/home2" className="flex min-h-11 shrink-0 items-center" aria-label={`${brandName} preview home`}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={brandName}
              width={120}
              height={32}
              priority
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="text-lg font-bold tracking-[-0.04em]">{brandName}</span>
          )}
        </Link>

        <nav aria-label="Shop types" className="hidden flex-1 items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center px-3 text-sm font-medium text-[#666666] hover:text-[#171717]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/search" method="get" className="hidden min-w-0 flex-1 lg:block lg:max-w-xs">
          <label className="sr-only" htmlFor="gadget-search">
            Search products
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d7d7d]" />
            <input
              id="gadget-search"
              name="q"
              type="search"
              placeholder="Search"
              className="h-11 w-full rounded-lg border border-[#eaeaea] bg-[#fafafa] pl-10 pr-3 text-sm text-[#171717] outline-none placeholder:text-[#7d7d7d] focus:border-[#171717]"
            />
          </div>
        </form>

        <Link
          href="/track"
          className="hidden min-h-11 items-center px-3 text-sm font-medium text-[#666666] hover:text-[#171717] lg:inline-flex"
        >
          Track
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#fafafa] lg:ml-0"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-[#171717] px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#fafafa] lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#eaeaea] px-4 py-4 lg:hidden">
          <form action="/search" method="get" className="mb-3">
            <label className="sr-only" htmlFor="gadget-search-mobile">
              Search products
            </label>
            <input
              id="gadget-search-mobile"
              name="q"
              type="search"
              placeholder="Search"
              className="h-11 w-full rounded-lg border border-[#eaeaea] bg-[#fafafa] px-3 text-sm"
            />
          </form>
          <nav className="grid gap-1" aria-label="Mobile shop">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/track"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center text-sm font-medium"
            >
              Track order
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
