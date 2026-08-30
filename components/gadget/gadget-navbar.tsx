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
    <header className="sticky top-0 z-40 bg-zinc-950 text-white">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        <Link href="/home2" className="flex min-h-11 shrink-0 items-center" aria-label={`${brandName} preview home`}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={brandName}
              width={120}
              height={32}
              priority
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          ) : (
            <span className="text-lg font-black tracking-tight uppercase">
              {brandName}
            </span>
          )}
        </Link>

        <nav aria-label="Categories" className="hidden flex-1 items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center px-3 text-sm font-semibold text-zinc-200 hover:text-white"
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
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="gadget-search"
              name="q"
              type="search"
              placeholder="Search"
              className="h-11 w-full rounded-sm border border-zinc-700 bg-zinc-900 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-golden-400"
            />
          </div>
        </form>

        <button
          type="button"
          onClick={openCart}
          aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-sm hover:bg-zinc-800 lg:ml-0"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-sm bg-golden-400 px-1 text-[10px] font-black text-zinc-950">
              {count}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-sm hover:bg-zinc-800 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-zinc-800 px-4 py-4 lg:hidden">
          <form action="/search" method="get" className="mb-3">
            <label className="sr-only" htmlFor="gadget-search-mobile">
              Search products
            </label>
            <input
              id="gadget-search-mobile"
              name="q"
              type="search"
              placeholder="Search"
              className="h-11 w-full rounded-sm border border-zinc-700 bg-zinc-900 px-3 text-sm"
            />
          </form>
          <nav className="grid gap-1" aria-label="Mobile categories">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-sm font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
