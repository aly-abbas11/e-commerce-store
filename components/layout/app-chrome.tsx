"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { FirstPartyTracker } from "@/components/analytics/first-party-tracker";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { GadgetFooter } from "@/components/gadget/gadget-footer";
import { gadgetFontClass } from "@/components/gadget/gadget-fonts";
import { GadgetNavbar } from "@/components/gadget/gadget-navbar";
import { TrustBar } from "@/components/sections/trust-bar";
import {
  readGadgetPreviewSession,
  shouldUseGadgetChrome,
  syncGadgetPreviewSession,
} from "@/lib/gadget-preview";
import type { ShopType } from "@/lib/categories";
import type { SiteSettings } from "@/lib/types";

export function AppChrome({
  children,
  settings,
  shopTypes,
  cartDrawer,
  reviewReminder,
  cartEffects,
  urgencyTicker,
  compareBar,
  demoBanner,
}: {
  children: ReactNode;
  settings: SiteSettings | null;
  shopTypes: ShopType[];
  cartDrawer: ReactNode;
  reviewReminder: ReactNode;
  cartEffects: ReactNode;
  urgencyTicker: ReactNode;
  compareBar: ReactNode;
  demoBanner: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    const search = searchParams?.toString() ?? "";
    syncGadgetPreviewSession(pathname, search);
    setSessionActive(
      readGadgetPreviewSession() || searchParams?.get("from") === "gadget"
    );
  }, [pathname, searchParams]);

  if (!pathname) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  const search = searchParams?.toString() ?? "";
  const gadget = shouldUseGadgetChrome(pathname, {
    search,
    sessionActive: sessionActive || searchParams?.get("from") === "gadget",
  });

  return (
    <CartProvider>
      <WishlistProvider>
        {gadget ? (
          <div className={`gadget-theme flex min-h-dvh flex-col overflow-x-clip ${gadgetFontClass}`}>
            {demoBanner}
            <GadgetNavbar settings={settings} shopTypes={shopTypes} />
            <main className="min-w-0 flex-1 bg-[var(--g-cream)]">{children}</main>
            <GadgetFooter settings={settings} shopTypes={shopTypes} />
            {cartDrawer}
            {cartEffects}
          </div>
        ) : (
          <>
            <FirstPartyTracker />
            {urgencyTicker}
            {demoBanner}
            <Navbar settings={settings} shopTypes={shopTypes} />
            <main className="flex-1">{children}</main>
            <TrustBar settings={settings} />
            <Footer settings={settings} shopTypes={shopTypes} />
            {cartDrawer}
            {reviewReminder}
            {cartEffects}
            {compareBar}
          </>
        )}
      </WishlistProvider>
    </CartProvider>
  );
}
