import Link from "next/link";

import { FALLBACK_SHOP_TYPES, shopTypeLinks, type ShopType } from "@/lib/categories";
import type { SiteSettings } from "@/lib/types";

export function GadgetFooter({
  settings,
  shopTypes = FALLBACK_SHOP_TYPES,
}: {
  settings: SiteSettings | null;
  shopTypes?: ShopType[];
}) {
  const brandName = settings?.brandName || "VoltGear";
  const links = shopTypeLinks(shopTypes);

  return (
    <footer className="bg-[#171717] text-[#aaaaaa]">
      <div className="grid gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-lg font-bold tracking-[-0.03em] text-white">{brandName}</p>
          <p className="mt-3 text-sm">Cool, useful tech — curated for how you actually shop.</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f766e]">Shop</h2>
          <ul className="mt-3 space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-11 items-center text-sm hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f766e]">Help</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href="/track" className="flex min-h-11 items-center hover:text-white">
                Track order
              </Link>
            </li>
            <li>
              <Link href="/warranty" className="flex min-h-11 items-center hover:text-white">
                Warranty &amp; returns
              </Link>
            </li>
            <li>
              <Link href="/contact" className="flex min-h-11 items-center hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0f766e]">Contact</h2>
          <p className="mt-3 text-sm">{settings?.phone || "Cash on delivery available."}</p>
          {settings?.email ? <p className="mt-2 text-sm">{settings.email}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-4 text-xs lg:px-8">
        <p>
          © {new Date().getFullYear()} {brandName}
        </p>
        <Link href="/" className="min-h-11 inline-flex items-center hover:text-white">
          View current shop
        </Link>
      </div>
    </footer>
  );
}
