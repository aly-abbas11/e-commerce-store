"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MegaMenu } from "@/components/layout/mega-menu";
import { CATEGORY_LINKS } from "@/lib/categories";
import { trackSearch } from "@/lib/analytics";
import { imageUrl } from "@/lib/sanity/image";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function SearchForm({
  className,
  autoFocus,
  onDone,
}: {
  className?: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  return (
    <form
      action="/search"
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        const q = new FormData(e.currentTarget).get("q")?.toString().trim();
        if (q) trackSearch(q);
        onDone?.();
      }}
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        name="q"
        autoFocus={autoFocus}
        placeholder="Search products…"
        aria-label="Search products"
        className="h-11 w-full rounded-full border bg-muted/50 pl-9 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

export function Navbar({ settings }: { settings: SiteSettings | null }) {
  const { count, openCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const brandName = settings?.brandName || "VoltGear";
  const logoUrl = settings?.logo
    ? imageUrl(settings.logo, { w: 256 })
    : undefined;

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  const Brand = (
    <Link
      href="/"
      className="flex min-h-11 shrink-0 items-center"
      aria-label={`${brandName} home`}
    >
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
        <span className="text-lg font-bold tracking-tight">
          {brandName}
          <span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );

  const CartButton = (
    <button
      onClick={openCart}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Desktop / tablet row */}
      <div className="hidden h-16 items-center gap-6 px-4 lg:flex lg:px-8">
        {Brand}

        <nav aria-label="Primary" className="flex items-center gap-1">
          {/* Category dropdown — hover for desktop, click also toggles */}
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              onClick={() => setMegaOpen((v) => !v)}
              className="flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              Shop
              <ChevronDown
                className={`h-4 w-4 transition-transform ${megaOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            <MegaMenu open={megaOpen} />
          </div>

          {PAGE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <SearchForm className="ml-auto w-56 max-w-xs shrink-0 lg:w-72 xl:w-80" />

        <ThemeToggle />
        {CartButton}
      </div>

      {/* Mobile row */}
      <div className="flex h-16 items-center gap-3 px-4 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav-drawer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>

        {Brand}

        <div className="ml-auto flex items-center">
          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle />
          {CartButton}
        </div>
      </div>

      {/* Mobile inline search row */}
      {mobileSearchOpen && (
        <div className="border-t bg-background px-4 py-3 lg:hidden">
          <SearchForm autoFocus />
        </div>
      )}

      {/* Full-screen mobile nav drawer */}
      {drawerOpen && (
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden animate-in fade-in slide-in-from-right-4 duration-200"
        >
          <div className="flex h-16 shrink-0 items-center gap-3 px-4">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
            {Brand}
            <div className="ml-auto">{CartButton}</div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <SearchForm onDone={() => setDrawerOpen(false)} className="mb-6" />

            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Shop by category
            </p>
            <nav
              aria-label="Categories"
              className="mt-2 grid grid-cols-2 gap-2"
            >
              {CATEGORY_LINKS.map((link) => {
                const cat = link.href.split("/").pop()!;
                const emoji: Record<string, string> = { smartwatch: "⌚", "power-bank": "🔋", charger: "🔌", earbuds: "🎧" };
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <span className="text-2xl">{emoji[cat] ?? "📦"}</span>
                    <span className="text-sm font-semibold">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Explore
            </p>
            <nav
              aria-label="Pages"
              className="mt-2 flex flex-col divide-y divide-border rounded-xl border"
            >
              {PAGE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </nav>

            {(settings?.email || settings?.phone) && (
              <div className="mt-8 space-y-1 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                {settings?.email && <p>{settings.email}</p>}
                {settings?.phone && <p>{settings.phone}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}